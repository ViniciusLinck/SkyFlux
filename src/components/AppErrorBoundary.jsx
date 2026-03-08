import { Component } from 'react'

export class AppErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, message: '' }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, message: error?.message || 'Falha inesperada na interface.' }
  }

  componentDidCatch(error) {
    // Keep diagnostics in console for local debugging.
    console.error('SkyFlux runtime error:', error)
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children
    }

    return (
      <div className="flex min-h-screen items-center justify-center bg-night-950 px-4 text-slate-100">
        <div className="w-full max-w-xl rounded-2xl border border-rose-400/30 bg-slate-950/85 p-6">
          <h1 className="text-xl font-bold text-rose-200">Falha ao renderizar a tela</h1>
          <p className="mt-2 text-sm text-slate-200">
            O app encontrou um erro de runtime. Recarregue a pagina e, se continuar, abra o
            console para diagnostico.
          </p>
          <p className="mt-2 rounded-lg bg-slate-900/70 p-2 text-xs text-rose-100">
            Detalhe: {this.state.message}
          </p>
        </div>
      </div>
    )
  }
}
