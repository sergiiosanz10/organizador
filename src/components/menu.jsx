import { useState, useRef, useLayoutEffect } from 'react';
import "../styles/menu.css";
import Tareas from './tareas';
import TareasCompletadas from './tareasCompletadas';
import TareasSinCompletar from './tareasPendientes';
import Calendario from './calendario';

export default function Menu({ acceder }) {
    const [activePage, setActivePage] = useState('Tareas');
    const [lineStyle, setLineStyle] = useState({});
    const refs = {
        Tareas: useRef(),
        'Tareas Completadas': useRef(),
        'Tareas Pendientes': useRef(),
        Calendario: useRef(),
    };

    //LOGOUT
    const handleLogout = () => {
        localStorage.removeItem('userId');
        acceder(false);
    }
    //######################################
    
    //CAMBIO DE PAGINA
    const menuRef = useRef(null);

    useLayoutEffect(() => {
        const rect = refs[activePage].current.getBoundingClientRect();
        const menuRect = menuRef.current.getBoundingClientRect();
        setLineStyle({ width: `${rect.width}px`, transform: `translateX(${rect.left - menuRect.left}px)` });
    }, [activePage]);

    //######################################
    return (
        <div className='body'>
            <nav className="Navigation" ref={menuRef}>
                <ul>
                    <span className="logo" onClick={() => window.location.reload()}><span className='taski'>Taski</span>fy</span>
                    <li ref={refs.Tareas} className={`opciones ${activePage === 'Tareas' ? 'active' : ''}`} onClick={() => setActivePage('Tareas')}>
                        Tareas
                    </li>
                    <li ref={refs['Tareas Completadas']} className={`opciones ${activePage === 'Tareas Completadas' ? 'active' : ''}`} onClick={() => setActivePage('Tareas Completadas')}>
                        Tareas Completadas
                    </li>
                    <li ref={refs['Tareas Pendientes']} className={`opciones ${activePage === 'Tareas Pendientes' ? 'active' : ''}`} onClick={() => setActivePage('Tareas Pendientes')}>
                        Tareas Pendientes
                    </li>
                    <li ref={refs.Calendario} className={`opciones ${activePage === 'Calendario' ? 'active' : ''}`} onClick={() => setActivePage('Calendario')}>
                        Calendario
                    </li>
                    <li className="Logout" onClick={handleLogout}>Cerrar Sesión</li>
                </ul>
                <div className="line" style={lineStyle} />
            </nav>
            <div>
                {activePage === 'Tareas' && <Tareas />}
                {activePage === 'Tareas Completadas' && <TareasCompletadas />}
                {activePage === 'Tareas Pendientes' && <TareasSinCompletar />}
                {activePage === 'Calendario' && <Calendario />}
            </div>
        </div>
    )
}