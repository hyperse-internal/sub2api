export default {
  pelicanBenchmark: {
    title: 'Pelican Benchmark',
    shortPrompt: 'Create an HTML page with an SVG 2D animation of a pelican riding a bicycle.',
    defaultPrompt:
      'Create an HTML page with an SVG 2D animation of a pelican riding a bicycle. No tests needed.',
    refresh: 'Refresh',
    retry: 'Retry',
    loading: 'Loading entries…',
    loadingMore: 'Loading…',
    loadMore: 'Load more',
    loadFailed: 'Failed to load benchmark data. Please try again.',
    emptyGroup: 'No entries yet',
    noPreview: 'No preview',
    duration: '{value} s',
    beijingTime: 'Beijing time',
    fitToWindow: 'Fit to window',
    downloadHtml: 'Download HTML',
    downloading: 'Downloading…',
    downloadFailed: 'Download failed',
    sandboxHint: 'Entries run in an isolated sandbox, preserving the model’s HTML and animation.',
    aboutTitle: 'About the pelican benchmark',
    aboutInterval:
      'Every {minutes} minutes we give each model the same task and show what it produces as-is, without picking or editing, so you can compare how different models write code and draw.',
    aboutPrompt: 'The task: “{prompt}”',
    aboutWhy:
      '“A pelican riding a bicycle” is a popular informal test for language models among developers: the task fits in one sentence, the result is easy to judge at a glance, and it is hard for a model to be tuned for it specifically.',
    modelsTitle: 'Models in this benchmark',
    sourceHint: 'Results are fetched via this site’s backend proxy from the AlphaIO pelican benchmark.',
    status: {
      queued: 'Queued',
      running: 'Generating',
      failed: 'Failed',
      succeeded: 'Completed',
      disqualified: 'Disqualified'
    }
  }
}
