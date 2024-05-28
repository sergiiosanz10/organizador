import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClock, faCheck } from '@fortawesome/free-solid-svg-icons'

import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';
import '../styles/calendario.css';


export default function Calendario() {
    const [events, setEvents] = useState([]);
    const [showModal, setShowModal] = useState(false);

        const userId = sessionStorage.getItem('userId');
        const token = sessionStorage.getItem('token');

const navigate = useNavigate();

useEffect(() => {
    const handleStorageChange = (e) => {
        if (e.key === 'userId' && e.storageArea === sessionStorage) {
            const sessionStorageUserId = sessionStorage.getItem('userId');
            if (sessionStorageUserId !== token) {
                // Cerrar la sesión
                sessionStorage.removeItem('token');
                sessionStorage.removeItem('userId');
                sessionStorage.removeItem('isLogged');
                window.location.reload();
                navigate('/login');
            }
        }
    };

    window.addEventListener('storage', handleStorageChange);

    fetch(`https://tfg.sergiiosanz.es/mostrarTareas.php?userId=${userId}&token=${token}`)
        .then(response => response.json())
        .then(data => {
            const tasks = data.map(task => {
                return {
                    id: task.tareaId,
                    Etiqueta: task.Etiqueta,
                    title: task.Nombre,
                    Descripcion: task.Descripcion,
                    Fecha: task.Fecha,
                    HoraInicio: task.HoraInicio,
                    HoraFin: task.HoraFin,
                    estado: task.Estado,
                    backgroundColor: task.Color,
                    start: `${task.Fecha}T${task.HoraInicio}`,
                    end: `${task.Fecha}T${task.HoraFin}`,
                };
            });
            setEvents(tasks);
            console.log(tasks);
        })
        .catch(error => {
            console.error('Ha habido un problema con tu operación de fetch:', error);
        });

    // Limpiar el evento al desmontar el componente
    return () => {
        window.removeEventListener('storage', handleStorageChange);
    };
}, [token, userId, navigate]);

    const enviarData = async (url, data) => {
        try {
            const response = await fetch(url, {
                method: 'PUT',
                body: JSON.stringify(data),
                headers: {
                    'Content-Type': 'application/json'
                },
            });
            const json = await response.json();
            console.log(data);
            return json;
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const URL_MODIFICAR_FECHA = "https://tfg.sergiiosanz.es/modiFecha.php";

    const handleEventDrop = async (info) => {
        const { event } = info;

        // Actualizar el estado de eventos para reflejar el cambio
        const updatedEvents = events.map((e) => {
            if (e.id === event.id) {
                return {
                    ...e,
                    start: event.start,
                    end: event.end,
                };
            }
            return e;
        });
        setEvents(updatedEvents);

        //Datos que se eviaran al servidor
        const data = {
            tareaId: event.id,
            fecha: event.start ? (event.start.getHours() !== 0 ? event.start.toISOString() : new Date(event.start.setHours(12)).toISOString()) : null,
        };

        // Enviar los datos al servidor
        const response = await enviarData(URL_MODIFICAR_FECHA, data);
        if (response.isUpdated) {
            console.log('La fecha se actualizó correctamente.');
        } else {
            console.error('No se pudo actualizar la fecha:', response.error);
            // Aquí podrías mostrar un mensaje al usuario, revertir el cambio en el calendario, etc.
        }
        // Comprobar la respuesta del servidor
        console.log(response);
    };



    const [setEtiquetas] = useState([]);

    useEffect(() => {
        
        fetch(`https://tfg.sergiiosanz.es/etiquetas.php?userId=${userId}`)
            .then(response => response.json())
            .then(data => setEtiquetas(data))
            .catch(error => console.error('Error:', error));
    }, [setEtiquetas]);

    const URL_MODITAREA = "https://tfg.sergiiosanz.es/modiTarea.php";

    const handleInputChange = async (field, value) => {
        if (selectedTask) {
            setSelectedTask(prevTask => ({
                ...prevTask,
                [field]: value,
            }));

            // Actualiza la tarea en la base de datos
            const data = {
                "tareaId": selectedTask.id,
                "etiqueta": field === 'Etiqueta' ? value : selectedTask.Etiqueta,
                "color": field === 'backgroundColor' ? value : selectedTask.backgroundColor,
                "nombre": field === 'title' ? value : selectedTask.title,
                "descripcion": field === 'Descripcion' ? value : selectedTask.Descripcion,
                "horaInicio": field === 'HoraInicio' ? value : selectedTask.HoraInicio,
                "horaFin": field === 'HoraFin' ? value : selectedTask.HoraFin,
                "fecha": field === 'Fecha' ? value : selectedTask.Fecha
            };
            await enviarData(URL_MODITAREA, data);

            // Actualiza el estado de events para reflejar los cambios
            setEvents(prevEvents => prevEvents.map(event => {
                if (event.id === selectedTask.id) {
                    return {
                        ...event,
                        title: field === 'title' ? value : event.title,
                        Descripcion: field === 'Descripcion' ? value : event.Descripcion,
                        backgroundColor: field === 'backgroundColor' ? value : event.backgroundColor,
                        start: field === 'Fecha' ? new Date(`${value}T${selectedTask.HoraInicio}`) : field === 'HoraInicio' ? new Date(`${data.fecha}T${value}`) : event.start,
                        end: field === 'Fecha' ? new Date(`${value}T${selectedTask.HoraFin}`) : field === 'HoraFin' ? new Date(`${data.fecha}T${value}`) : event.end,

                    };
                }
                return event;
            }));
        } else {
            console.log(`No task selected`);
        }
    };
    //####################################################################

    const [selectedTask, setSelectedTask] = useState(null); // Nuevo estado para almacenar la tarea seleccionada


    const handleEventClick = async (info) => {
        const { event } = info;
        const eventId = Number(event.id);

        // Find the corresponding task in your state
        const selectedTask = events.find(e => e.id === eventId);

        if (selectedTask) {
            setSelectedTask(selectedTask);
            setShowModal(true);
        } else {
            console.log(`No task found with id ${event.id}`);
        }


        //Datos que se eviaran al servidor
        const data = {
            tareaId: event.id,
            Etiqueta: event.extendedProps.Etiqueta,
            Nombre: event.title,
            Descripcion: event.extendedProps.Descripcion,
            Fecha: event.extendedProps.Fecha,
            HoraInicio: event.extendedProps.HoraInicio,
            HoraFin: event.extendedProps.HoraFin,
            Estado: event.extendedProps.estado,
            Color: event.backgroundColor
        };
        console.log(data);
    };
    return (
        <>
            <div className="header">
                <h1 className='titulo'>Calendario</h1>
            </div>
            <div className='calendario'>
                <FullCalendar
                    plugins={[dayGridPlugin, interactionPlugin]}
                    locale={esLocale}
                    events={events}
                    displayEventEnd={true}
                    slotLabelFormat={{
                        hour: '2-digit',
                        minute: '2-digit',
                        omitZeroMinute: false,
                        meridiem: 'short'
                    }}
                    eventTimeFormat={{
                        hour: '2-digit',
                        minute: '2-digit',
                        meridiem: 'short'
                    }}
                    eventContent={renderEventContent}
                    editable={true}
                    eventDrop={handleEventDrop}
                    eventClick={handleEventClick}
                />
            </div>
            {showModal && selectedTask && (
                <div className="modal">
                    <div className="modal-content">
                        <form>
                            <div>
                                <input
                                    type="text"
                                    className='etiqueta'
                                    value={selectedTask.Etiqueta}
                                    placeholder='Etiqueta de Tarea'
                                    onChange={(e) => handleInputChange('Etiqueta', e.target.value)}
                                />
                                <input type="text" value={selectedTask.title} onChange={(e) => handleInputChange('title', e.target.value)} placeholder='Nombre de la Tarea' />
                                <input type="text" value={selectedTask.Descripcion} onChange={(e) => handleInputChange('Descripcion', e.target.value)} placeholder='Descripcion de la Tarea' />
                                <input type="time" value={selectedTask.HoraInicio} onChange={(e) => handleInputChange('HoraInicio', e.target.value)} />
                                <input type="time" value={selectedTask.HoraFin} onChange={(e) => handleInputChange('HoraFin', e.target.value)} />
                                <input type="date" value={selectedTask.Fecha} onChange={(e) => handleInputChange('Fecha', e.target.value)} />
                                <label className="colorLabel">Color de la Tarea:</label>
                                <input type="color" className='colorInput' value={selectedTask.backgroundColor} onChange={(e) => handleInputChange('backgroundColor', e.target.value)} />
                                <button onClick={() => setShowModal(false)}>Cerrar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    )
    
    //ESTILO PARA LOS EVENTOS DEL CALENDARIO
    function renderEventContent(eventInfo) {
        const estado = eventInfo.event.extendedProps.estado;
        const estadoIcono = estado === 0 ? <FontAwesomeIcon icon={faClock} /> : <FontAwesomeIcon icon={faCheck} />;

        return (
            <div className="event-container" style={{ backgroundColor: eventInfo.event.backgroundColor || 'gray' }}>
                <div>
                    <div className="event-time">{eventInfo.timeText}</div>
                    <div className="event-status">{estadoIcono}</div>
                </div>
                <div className="event-title">{eventInfo.event.title}</div>
                <div className="event-descrip">{eventInfo.event.extendedProps.Descripcion}</div>
            </div>
        );
    }
    //####################################################################
}