package service

import (
	"context"
	"testing"
	"time"

	"github.com/Wei-Shaw/sub2api/internal/pkg/pagination"
	"github.com/stretchr/testify/require"
)

type announcementRepoStub struct {
	item *Announcement
}

func (s *announcementRepoStub) Create(_ context.Context, a *Announcement) error {
	s.item = a
	return nil
}

func (s *announcementRepoStub) GetByID(_ context.Context, _ int64) (*Announcement, error) {
	if s.item == nil {
		return nil, ErrAnnouncementNotFound
	}
	return s.item, nil
}

func (s *announcementRepoStub) Update(_ context.Context, a *Announcement) error {
	s.item = a
	return nil
}

func (*announcementRepoStub) Delete(context.Context, int64) error {
	return nil
}

func (*announcementRepoStub) List(context.Context, pagination.PaginationParams, AnnouncementListFilters) ([]Announcement, *pagination.PaginationResult, error) {
	return nil, nil, nil
}

func (*announcementRepoStub) ListActive(context.Context, time.Time) ([]Announcement, error) {
	return nil, nil
}

func TestAnnouncementServiceCreateRejectsEqualStartEndTimes(t *testing.T) {
	repo := &announcementRepoStub{}
	svc := NewAnnouncementService(repo, nil, nil, nil)
	now := time.Unix(1776790020, 0)

	_, err := svc.Create(context.Background(), &CreateAnnouncementInput{
		Title:      "公告",
		Content:    "内容",
		Status:     AnnouncementStatusActive,
		NotifyMode: AnnouncementNotifyModePopup,
		StartsAt:   &now,
		EndsAt:     &now,
	})
	require.ErrorIs(t, err, ErrAnnouncementInvalidSchedule)
}

func TestAnnouncementServiceCreateAcceptsNoticeBarNotifyMode(t *testing.T) {
	repo := &announcementRepoStub{}
	svc := NewAnnouncementService(repo, nil, nil, nil)

	got, err := svc.Create(context.Background(), &CreateAnnouncementInput{
		Title:      "通告栏",
		Content:    "内容",
		Status:     AnnouncementStatusActive,
		NotifyMode: AnnouncementNotifyModeNoticeBar,
	})
	require.NoError(t, err)
	require.Equal(t, AnnouncementNotifyModeNoticeBar, got.NotifyMode)
}

func TestAnnouncementServiceGlobalBarNotifyMode(t *testing.T) {
	repo := &announcementRepoStub{}
	svc := NewAnnouncementService(repo, nil, nil, nil)
	created, err := svc.Create(context.Background(), &CreateAnnouncementInput{
		Title: "全局通告栏", Content: "**内容**", Status: AnnouncementStatusActive,
		NotifyMode: AnnouncementNotifyModeGlobalBar,
	})
	require.NoError(t, err)
	require.Equal(t, AnnouncementNotifyModeGlobalBar, created.NotifyMode)

	mode := AnnouncementNotifyModeSilent
	_, err = svc.Update(context.Background(), created.ID, &UpdateAnnouncementInput{NotifyMode: &mode})
	require.NoError(t, err)
	mode = AnnouncementNotifyModeGlobalBar
	updated, err := svc.Update(context.Background(), created.ID, &UpdateAnnouncementInput{NotifyMode: &mode})
	require.NoError(t, err)
	require.Equal(t, AnnouncementNotifyModeGlobalBar, updated.NotifyMode)
	mode = "invalid"
	_, err = svc.Update(context.Background(), created.ID, &UpdateAnnouncementInput{NotifyMode: &mode})
	require.ErrorIs(t, err, ErrAnnouncementInvalidNotifyMode)
}

func TestAnnouncementServiceUpdateRejectsEqualStartEndTimes(t *testing.T) {
	repo := &announcementRepoStub{
		item: &Announcement{
			ID:         1,
			Title:      "公告",
			Content:    "内容",
			Status:     AnnouncementStatusActive,
			NotifyMode: AnnouncementNotifyModePopup,
		},
	}
	svc := NewAnnouncementService(repo, nil, nil, nil)
	now := time.Unix(1776790020, 0)
	startsAt := &now
	endsAt := &now

	_, err := svc.Update(context.Background(), 1, &UpdateAnnouncementInput{
		StartsAt: &startsAt,
		EndsAt:   &endsAt,
	})
	require.ErrorIs(t, err, ErrAnnouncementInvalidSchedule)
}
