package admin

import (
	"testing"

	"github.com/gin-gonic/gin/binding"
	"github.com/stretchr/testify/require"
)

func TestAnnouncementRequestsAcceptGlobalBar(t *testing.T) {
	mode := "global_bar"
	require.NoError(t, binding.Validator.ValidateStruct(CreateAnnouncementRequest{
		Title: "全局通告栏", Content: "内容", NotifyMode: mode,
	}))
	require.NoError(t, binding.Validator.ValidateStruct(UpdateAnnouncementRequest{NotifyMode: &mode}))
	mode = "invalid"
	require.Error(t, binding.Validator.ValidateStruct(CreateAnnouncementRequest{
		Title: "全局通告栏", Content: "内容", NotifyMode: mode,
	}))
	require.Error(t, binding.Validator.ValidateStruct(UpdateAnnouncementRequest{NotifyMode: &mode}))
}
