import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'

import RedeemView from '../RedeemView.vue'

const { listRedeemCodes, batchDeleteRedeemCodes, getAllGroups, showSuccess, showError, showInfo } =
  vi.hoisted(() => ({
    listRedeemCodes: vi.fn(),
    batchDeleteRedeemCodes: vi.fn(),
    getAllGroups: vi.fn(),
    showSuccess: vi.fn(),
    showError: vi.fn(),
    showInfo: vi.fn()
  }))

vi.mock('@/api/admin', () => ({
  adminAPI: {
    redeem: {
      list: listRedeemCodes,
      generate: vi.fn(),
      delete: vi.fn(),
      batchDelete: batchDeleteRedeemCodes,
      batchUpdate: vi.fn(),
      exportCodes: vi.fn()
    },
    groups: {
      getAll: getAllGroups
    }
  }
}))

vi.mock('@/stores/app', () => ({
  useAppStore: () => ({
    showSuccess,
    showError,
    showInfo
  })
}))

vi.mock('@/composables/useClipboard', () => ({
  useClipboard: () => ({
    copyToClipboard: vi.fn()
  })
}))

vi.mock('vue-i18n', async () => {
  const actual = await vi.importActual<typeof import('vue-i18n')>('vue-i18n')
  return {
    ...actual,
    useI18n: () => ({
      t: (key: string) => key
    })
  }
})

const DataTableStub = {
  props: ['columns', 'data'],
  template: `
    <table>
      <thead>
        <tr>
          <th v-for="column in columns" :key="column.key">
            <slot :name="'header-' + column.key" :column="column">{{ column.label }}</slot>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in data" :key="row.id">
          <td v-for="column in columns" :key="column.key">
            <slot :name="'cell-' + column.key" :row="row" :value="row[column.key]">
              {{ row[column.key] }}
            </slot>
          </td>
        </tr>
      </tbody>
    </table>
  `
}

const ConfirmDialogStub = {
  props: ['show', 'title', 'message'],
  emits: ['confirm', 'cancel'],
  template: `
    <div v-if="show" data-test="batch-delete-confirm-dialog">
      <p>{{ message }}</p>
      <button data-test="batch-delete-confirm-btn" type="button" @click="$emit('confirm')">confirm</button>
      <button data-test="batch-delete-cancel-btn" type="button" @click="$emit('cancel')">cancel</button>
    </div>
  `
}

describe('admin RedeemView batch delete', () => {
  beforeEach(() => {
    localStorage.clear()
    document.body.innerHTML = ''

    listRedeemCodes.mockReset()
    batchDeleteRedeemCodes.mockReset()
    getAllGroups.mockReset()
    showSuccess.mockReset()
    showError.mockReset()
    showInfo.mockReset()

    listRedeemCodes.mockResolvedValue({
      items: [
        {
          id: 1,
          code: 'CODE-1',
          type: 'balance',
          value: 10,
          status: 'unused',
          used_by: null,
          used_at: null,
          created_at: '2026-01-01T00:00:00Z',
          expires_at: null
        },
        {
          id: 2,
          code: 'CODE-2',
          type: 'balance',
          value: 20,
          status: 'used',
          used_by: 9,
          used_at: '2026-01-02T00:00:00Z',
          expires_at: null
        },
        {
          id: 3,
          code: 'CODE-3',
          type: 'balance',
          value: 30,
          status: 'unused',
          used_by: null,
          used_at: null,
          created_at: '2026-01-01T00:00:00Z',
          expires_at: null
        }
      ],
      total: 3,
      page: 1,
      page_size: 20,
      pages: 1
    })
    batchDeleteRedeemCodes.mockResolvedValue({ deleted: 2, message: 'ok' })
    getAllGroups.mockResolvedValue([])
  })

  const mountView = () =>
    mount(RedeemView, {
      attachTo: document.body,
      global: {
        stubs: {
          AppLayout: { template: '<div><slot /></div>' },
          TablePageLayout: {
            template:
              '<div><slot name="filters" /><slot name="table" /><slot name="pagination" /></div>'
          },
          DataTable: DataTableStub,
          Pagination: true,
          ConfirmDialog: ConfirmDialogStub,
          Select: true,
          GroupBadge: true,
          GroupOptionItem: true,
          Icon: true,
          Teleport: true
        }
      }
    })

  it('blocks delete dialog when selected codes include non-unused status', async () => {
    const wrapper = mountView()
    await flushPromises()

    await wrapper.findAll('[data-test="select-code"]')[0].setValue(true)
    await wrapper.findAll('[data-test="select-code"]')[1].setValue(true)
    await wrapper.get('[data-test="selection-batch-delete"]').trigger('click')
    await flushPromises()

    expect(showError).toHaveBeenCalledWith('admin.redeem.deleteOnlyUnusedSelected')
    expect(wrapper.find('[data-test="batch-delete-confirm"]').exists()).toBe(false)
    expect(batchDeleteRedeemCodes).not.toHaveBeenCalled()
  })

  it('deletes selected unused redeem codes after confirmation', async () => {
    const wrapper = mountView()
    await flushPromises()

    await wrapper.findAll('[data-test="select-code"]')[0].setValue(true)
    await wrapper.findAll('[data-test="select-code"]')[2].setValue(true)
    await wrapper.get('[data-test="selection-batch-delete"]').trigger('click')
    await flushPromises()

    expect(wrapper.get('[data-test="batch-delete-confirm"]').text()).toContain(
      'admin.redeem.deleteSelectedConfirm'
    )

    await wrapper.get('[data-test="batch-delete-confirm-btn"]').trigger('click')
    await flushPromises()

    expect(batchDeleteRedeemCodes).toHaveBeenCalledWith(expect.arrayContaining([1, 3]))
    expect(batchDeleteRedeemCodes.mock.calls[0][0]).toHaveLength(2)
    expect(showSuccess).toHaveBeenCalledWith('admin.redeem.selectedCodesDeleted')
    expect(listRedeemCodes).toHaveBeenCalledTimes(2)
  })
})
