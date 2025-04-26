import HierarchicalTable from './HierarchialTable'
import { InitialData } from './InitialData'

export const MainPage = () => {

    return (
        <>
            <nav style={{ display: "flex", flexDirection: 'row', alignItems: 'center', width: '100%', height: '60px',  
                position: 'fixed', top: 0, left: 0, zIndex: 1000, boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                backgroundColor: '#f0f0f0', padding: '10px 20px' }}>
                <img src="lumel.svg" alt="Logo" style={{ width: '50px', height: '50px', marginRight: '20px' }} />
                <h1 style={{ margin: 0 }}>Hierarchical Table</h1>
            </nav>
            <div style={{ marginTop: '70px' }}>
                <HierarchicalTable data={InitialData} />
            </div>
        </>
    )
}
