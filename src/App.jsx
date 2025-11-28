import Layout from './components/Layout/Layout.jsx'
import Sidebar from './components/Sidebar/Sidebar.jsx'
import CanvasPlaceholder from './components/Canvas/CanvasPlaceholder.jsx'
import { PaletteProvider } from './state/PaletteContext'

const DEFAULT_SECTIONS = [
  {
      title: 'Diagrams',
      key: 'diagrams',
      items: [
        { type: 'init-diag', label: 'New Diagram', opened: true, nodes: [], edges: [] }
      ]
  },
  {
    title: 'Wires',
    key: 'wires',
    items: [],
  },
  {
    title: 'Boxes',
    key: 'boxes',
    items: [],
  },
  {
    title: 'Equations',
    key: 'equations',
    items: []
  }
];

export default function App() {
  return (
    <PaletteProvider initialSections={DEFAULT_SECTIONS}>
      <Layout sidebar={<Sidebar />}>
        <CanvasPlaceholder />
      </Layout>
    </PaletteProvider>
  )
}
