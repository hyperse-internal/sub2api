export default {
  imageStudio: {
    title: 'Image generation',
    description: 'Generate images with the models available to your API keys.',
    subtitle: 'Models and keys come from the account you are logged in with.',
    backToSystem: 'Back to the console',
    prompt: 'Prompt',
    promptPlaceholder: 'Describe the image you want',
    promptHelper: {
      title: 'Prompt helper',
      categories: {
        quality: 'Quality',
        style: 'Style',
        composition: 'Composition',
        lighting: 'Lighting',
        color: 'Color',
        material: 'Material'
      }
    },
    model: 'Model',
    parameters: 'Parameters',
    size: 'Size',
    quality: 'Quality',
    quantity: 'Count',
    format: 'Format',
    compression: 'Compression',
    compressionUnsupported: 'Not available for PNG',
    background: 'Background',
    backgrounds: { auto: 'Auto', opaque: 'Opaque', transparent: 'Transparent' },
    reference: 'References',
    referenceClipboard: 'Clipboard',
    referenceUpload: 'Upload',
    referenceEmpty: 'No reference images',
    removeFile: 'Remove image',
    editUnavailable: 'This model does not support reference images.',
    submitGenerate: 'Generate image',
    submitEdit: 'Edit image',
    generating: 'Generating…',
    costHint: 'Each generation uses the quota of the selected key.',
    download: 'Download',
    usingKey: 'Using key {name}',
    emptyModels: 'No image models are available. Create an active OpenAI or Grok key in a group with image generation enabled.',
    openKeys: 'Manage API keys',
    loadFailed: 'Could not load models for your keys.',
    reloadCatalog: 'Refresh and retry',
    emptyResult: 'The gateway returned no image.',
    timeout: 'Image generation timed out.',
    resultEmpty: 'Generated images will appear here.',
    historySaveFailed: 'The image was generated, but it could not be saved locally.',
    insufficientBalance: {
      title: 'Insufficient account balance',
      description:
        'Your account balance is too low to call image generation (code: INSUFFICIENT_BALANCE). Top up first, then come back to generate.',
      detail:
        'Gateway response: Insufficient account balance. When balance is below the auth threshold, model listing and image requests for your keys are rejected.',
      stepsTitle: 'What to do',
      steps: {
        recharge: 'Open the purchase page, choose an amount, and complete payment (or redeem a code).',
        wait: 'Wait for the balance to land — it usually applies right after a successful payment.',
        retry: 'Return here, click “Refresh and retry”, confirm models load, then generate again.'
      },
      openPurchase: 'Top up',
      tip: 'If you just topped up and still see this, wait a moment and refresh. For subscription groups, confirm the subscription is still active.'
    },
    modules: { chat: 'Generate', history: 'History', chatTip: 'Generation', historyTip: 'History' },
    history: {
      title: 'History',
      hint: 'The latest 10 images stay in this browser.',
      empty: 'No history yet.',
      loadFailed: 'Could not load history.',
      deleteFailed: 'Could not delete this image.',
      pickTitle: 'Choose from history',
      pickHint: 'You can add {count} more.',
      preview: 'Preview',
      download: 'Download',
      delete: 'Delete',
      add: 'Add selected'
    },
    canvas: {
      flipX: 'Flip H',
      flipY: 'Flip V',
      reset: 'Reset',
      infoTitle: 'Image info',
      info: {
        name: 'Name',
        byteSize: 'Size',
        resolution: 'Resolution',
        format: 'Format',
        model: 'Model',
        size: 'Requested size',
        quality: 'Quality',
        createdAt: 'Created',
        prompt: 'Prompt'
      }
    },
    errors: {
      invalid_prompt: 'Enter a prompt.',
      prompt_too_long: 'The prompt is too long.',
      too_many_references: 'Too many reference images.',
      image_too_large: 'A reference image is too large.',
      invalid_image_type: 'Use a PNG, JPEG, or WebP image.',
      clipboard_unavailable: 'Clipboard images are not available.',
      edit_unsupported: 'This model cannot edit images.',
      invalid_count: 'Count must be between 1 and 4.',
      missing_model: 'Choose a model first.'
    }
  }
}
