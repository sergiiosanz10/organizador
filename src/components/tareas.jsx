import React from 'react';
import { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClock, faTrash, faCheck, faFileCirclePlus, faFilter, faPalette } from '@fortawesome/free-solid-svg-icons'

import '../styles/tareas.css';

export default function Tareas() {
    const [showModal, setShowModal] = useState(false);
    const [etiqueta, setEtiqueta] = useState('');
    const [color, setColor] = useState('');
    const [nombre, setNombre] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [tareas, setTareas] = useState([]);
    const [fecha, setFecha] = useState('');
    const [horaInicio, setHoraInicio] = useState('');
    const [horaFin, setHoraFin] = useState('');

    const userId = sessionStorage.getItem('userId');
    const token = sessionStorage.getItem('token');

    const handleColorChange = (event) => {
        setColor(event.target.value);
    };

    const handleNombreChange = (event) => {
        setNombre(event.target.value);
    };

    const handleDescripcionChange = (event) => {
        setDescripcion(event.target.value);
    };

    //CREAR NUEVA TAREA

    const etiquetaRef = useRef();
    const nombreRef = useRef();
    const descripcionRef = useRef();


    const enviarData = async (url, data) => {

        const response = await fetch(url, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json'
            },
        });
        //console.log(respuesta);
        const json = await response.json();
        console.log(data);
        //console.log(json);
        return json;

    };

    const URL_TAREA = "https://taskify.sergiiosanz.es/crearTarea.php";

    const handleFormSubmit = async (event) => {
        event.preventDefault();

        const tarea = {
            "etiqueta": etiquetaRef.current.value,
            "color": color,
            "nombre": nombreRef.current.value,
            "descripcion": descripcionRef.current.value,
            "fecha": fecha,
            "horaInicio": horaInicio,
            "horaFin": horaFin,
            "estado": '0',
            "userId": userId
        };
        await enviarData(URL_TAREA, tarea);

        // Limpia el formulario
        setNombre('');
        setDescripcion('');

        etiquetaRef.current.value = '';
        nombreRef.current.value = '';
        descripcionRef.current.value = '';
        setShowModal(false);

        // Solicita la lista actualizada de tareas al servidor
        fetch(`https://taskify.sergiiosanz.es/mostrarTareas.php?userId=${userId}`)
            .then(response => response.json())
            .then(data => setTareas(data));

        //Actualiza las etiquetas
        fetch(`https://taskify.sergiiosanz.es/etiquetas.php?userId=${userId}`)
            .then(response => response.json())
            .then(data => setEtiquetas(data));

        // Si actualmente estás filtrando por una etiqueta, actualiza las tareas filtradas
        if (serverResponse) {
            fetch(`https://taskify.sergiiosanz.es/filtrarEtiquetas.php?etiqueta=${etiqueta}&userId=${userId}`)
                .then(response => response.json())
                .then(data => {
                    setTareas(data);
                    setServerResponse(data); // Actualiza serverResponse
                });
        }
    };
    //####################################################################
    //MOSTRAR TAREAS
    useEffect(() => {
        fetch(`https://taskify.sergiiosanz.es/mostrarTareas.php?userId=${userId}&token=${token}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Conexión rechazada por el servidor');
                }
                return response.json();
            })
            .then(data => {
                if (data.error) {
                    if (data.error === 'Token incorrecto') {
                        // Aquí es donde cierras la sesión
                        sessionStorage.removeItem('token');
                    }
                } else {
                    setTareas(data);
                }
            })
            .catch(error => {
                console.error('Hubo un problema al mostrar las tareas :', error);
            });
    }, []);

    //CAMBIAR ESTADO DE TAREA ##########################################
    const URL_MODIESTADO = "https://taskify.sergiiosanz.es/modiEstado.php";

    const handleEstadoChange = async (index) => {
        const newTareas = [...tareas];
        newTareas[index].Estado = newTareas[index].Estado === 0 ? 1 : 0;
        setTareas(newTareas);

        // Actualiza serverResponse si existe
        if (serverResponse) {
            const newServerResponse = [...serverResponse];
            const serverResponseIndex = newServerResponse.findIndex(tarea => tarea.tareaId === newTareas[index].tareaId);
            if (serverResponseIndex !== -1) {
                newServerResponse[serverResponseIndex].Estado = newTareas[index].Estado;
                setServerResponse(newServerResponse);
            }
        }

        // Actualiza el estado de la tarea en la base de datos
        const tarea = newTareas[index];
        const data = {
            "tareaId": tarea.tareaId,
            "estado": tarea.Estado
        };
        await enviarData(URL_MODIESTADO, data);
    };
    //####################################################################

    //MODIFICAR INPUTS DE TAREA ########################################

    const URL_MODITAREA = "https://taskify.sergiiosanz.es/modiTarea.php";

    const handleInputChange = async (index, field, value) => {
        const newTareas = [...tareas];
        newTareas[index][field] = value;
        setTareas(newTareas);

        // Actualiza serverResponse si existe
        if (serverResponse) {
            const newServerResponse = [...serverResponse];
            const serverResponseIndex = newServerResponse.findIndex(tarea => tarea.tareaId === newTareas[index].tareaId);
            if (serverResponseIndex !== -1) {
                newServerResponse[serverResponseIndex][field] = value;
                setServerResponse(newServerResponse);
            }
        }

        // Actualiza la tarea en la base de datos
        const tarea = newTareas[index];
        const data = {
            "tareaId": tarea.tareaId,
            "etiqueta": tarea.Etiqueta,
            "color": tarea.Color,
            "nombre": tarea.Nombre,
            "descripcion": tarea.Descripcion,
            "horaInicio": tarea.HoraInicio,
            "horaFin": tarea.HoraFin,
            "fecha": tarea.Fecha
        };
        await enviarData(URL_MODITAREA, data);

        fetch(`https://taskify.sergiiosanz.es/etiquetas.php?userId=${userId}`)
            .then(response => response.json())
            .then(data => setEtiquetas(data));
    };

    //####################################################################

    //################### ELIMINAR TAREA #################################
    const URL_DELETETAREA = "https://taskify.sergiiosanz.es/eliminarTareas.php";


    const handleDelete = async (index) => {
        let newTareas = [...tareas];
        const tareaId = newTareas[index].tareaId;
        const Etiqueta = newTareas[index].Etiqueta;

        // Elimina la tarea de la base de datos
        const data = {
            "tareaId": tareaId,
            "userId": userId,
            "etiqueta": Etiqueta
        };
        await enviarData(URL_DELETETAREA, data);

        // Solicita la lista actualizada de tareas al servidor
        fetch(`https://taskify.sergiiosanz.es/mostrarTareas.php?userId=${userId}`)
            .then(response => response.json())
            .then(data => setTareas(data));

        //Actualiza las etiquetas
        fetch(`https://taskify.sergiiosanz.es/etiquetas.php?userId=${userId}`)
            .then(response => response.json())
            .then(data => setEtiquetas(data));
    };

    //####################################################################

    //FECHA DE TAREAS
    const handleFechaChange = (event) => {
        setFecha(event.target.value);
    };
    //####################################################################

    //HORA DE TAREAS
    const handleHoraInicioChange = (event) => {
        setHoraInicio(event.target.value);
    };

    const handleHoraFinChange = (event) => {
        setHoraFin(event.target.value);
    };
    //####################################################################

    //ORDENAR TAREAS POR FECHA y HORA

    const tareasOrdenadas = tareas.sort((a, b) => {
        const fechaHoraA = new Date(a.Fecha + 'T' + a.HoraInicio);
        const fechaHoraB = new Date(b.Fecha + 'T' + b.HoraInicio);
        return fechaHoraA - fechaHoraB;
    });

    //####################################################################

    //CAMBIAR ETIQUETA DE TAREA

    const [etiquetas, setEtiquetas] = useState([]);

    const handleEtiquetaChange = (event) => {
        setEtiqueta(event.target.value);
    };

    useEffect(() => {
        fetch(`https://taskify.sergiiosanz.es/mostrarTareas.php?userId=${userId}`)
            .then(response => response.json())
            .then(data => setEtiquetas(data))
            .catch(error => console.error('Error:', error));
    }, [userId]);
    //####################################################################
    //FILTRAR TAREAS POR ETIQUETA
    const [showDropdown, setShowDropdown] = useState(false);
    const uniqueEtiquetas = [...new Set(etiquetas.map(etiqueta => etiqueta.Etiqueta))];
    const [serverResponse, setServerResponse] = useState(null);


    const handleEtiquetaClick = async (etiqueta) => {
        // Aquí puedes enviar el dato de la etiqueta al servidor
        const response = await fetch(`https://taskify.sergiiosanz.es/filtrarEtiquetas.php?etiqueta=${etiqueta}&userId=${userId}`);
        const data = await response.json();
        setServerResponse(data);
        console.log(data);

        // Actualiza las tareas filtradas
        fetch(`https://taskify.sergiiosanz.es/filtrarEtiquetas.php?etiqueta=${etiqueta}&userId=${userId}`)
            .then(response => response.json())
            .then(data => {
                setTareas(data);
            });

        // Esconde el menú desplegable de las etiquetas
        setShowDropdown(false);
    };

    const handleDelete2 = async (index) => {
        const tarea = serverResponse[index];
        const tareaId = tarea.tareaId;
        const Etiqueta = tarea.Etiqueta;

        // Elimina la tarea de la base de datos
        const data = {
            "tareaId": tareaId,
            "userId": userId,
            "etiqueta": Etiqueta
        };
        await enviarData(URL_DELETETAREA, data);

        // Actualiza serverResponse para reflejar la tarea eliminada
        const updatedServerResponse = serverResponse.filter((tarea, i) => i !== index);
        setServerResponse(updatedServerResponse);

        // Actualiza las etiquetas
        fetch(`https://taskify.sergiiosanz.es/etiquetas.php?userId=${userId}`)
            .then(response => response.json())
            .then(data => setEtiquetas(data));
    };
    //####################################################################

    //COLOR DE TAREAS
    const [colores, setColors] = useState([]);

    const URL_COLOR = "https://taskify.sergiiosanz.es/colores.php";

    // Cuando el usuario guarda un color
    const addColor = async (index, value, color) => {
        const newTareas = [...tareas];
        if (newTareas[index]) {
            newTareas[index].Color = value;
            setTareas(newTareas);

            // Actualiza la tarea en la base de datos
            const tarea = newTareas[index];
            const data = {
                "userId": userId,
                "color": tarea.Color,
            };

            await enviarData(URL_COLOR, data);

            // Actualiza los colores en la paleta
            fetch(`https://taskify.sergiiosanz.es/mostrarColores.php?userId=${userId}`)
                .then(response => response.json())
                .then(data => {
                    setColors(data.map(colorObj => colorObj.color));
                });
        }
    };

    //MOSTRAR COLORES 
    useEffect(() => {
        // Reemplaza esto con tu propia función para obtener los colores de la base de datos
        async function fetchColors() {
            const response = await fetch(`https://taskify.sergiiosanz.es/mostrarColores.php?userId=${userId}`);
            const data = await response.json();
            setColors(data.map(colorObj => colorObj.color)); // Aquí asumimos que cada objeto tiene una propiedad 'color'
        }

        fetchColors();
    }, [userId]); // Añade userId como dependencia para que la función se ejecute cada vez que cambie

    //ELIMINAR COLORES




    //####################################################################

    return (
        <div>
            <div className="header">
                <h1 className='titulo' >Tareas</h1>
                <button className="nueva-tarea" onClick={() => setShowModal(true)}><FontAwesomeIcon icon={faFileCirclePlus} /></button>
                <div>
                    <button className="filtro" onClick={() => setShowDropdown(!showDropdown)}>
                        <FontAwesomeIcon icon={faFilter} />
                    </button>
                    {showDropdown && (
                        <div className="dropdown">
                            {uniqueEtiquetas.map((etiqueta, index) => (
                                <p key={index} onClick={() => handleEtiquetaClick(etiqueta)}>{etiqueta}</p>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            {showModal && (
                <div className="modal">
                    <div className="modal-content">
                        <form onSubmit={handleFormSubmit}>
                            <input
                                type="text"
                                ref={etiquetaRef}
                                value={etiqueta}
                                onChange={handleEtiquetaChange}
                                placeholder='Etiqueta de Tarea'
                            />
                            <input type="text" ref={nombreRef} value={nombre} onChange={handleNombreChange} placeholder='Nombre de la Tarea' />
                            <input type="text" ref={descripcionRef} value={descripcion} onChange={handleDescripcionChange} placeholder='Descripcion de la Tarea' />
                            <input type="time" value={horaInicio} onChange={handleHoraInicioChange} />
                            <input type="time" value={horaFin} onChange={handleHoraFinChange} />
                            <input type="date" value={fecha} onChange={handleFechaChange} />
                            <label className="colorLabel">Color de la Tarea:</label>
                            <input type="color" className='colorInput' value={color} onChange={handleColorChange} list="color-datalist" />
                            <datalist id="color-datalist">
                                {colores.map((color, index) => (
                                    <option key={index} value={color} />
                                ))}
                            </datalist>
                            <button type="submit">Crear</button>
                            <button onClick={() => setShowModal(false)}>Cancelar</button>
                        </form>
                    </div>
                </div>
            )}

            {/** CONTENEDOR DE TAREAS FILTRADAS */}
            <div className='tareasContainer'>
                {serverResponse ? (serverResponse.map((tarea, index) => (
                    <div className='mostrarTareas' key={index}>
                        <input type="time" className='time' value={tarea.HoraInicio} onChange={(e) => handleInputChange(index, 'HoraInicio', e.target.value)} />
                        <input type="time" className='time' value={tarea.HoraFin} onChange={(e) => handleInputChange(index, 'HoraFin', e.target.value)} />
                        <input
                            type="text"
                            className='etiqueta'
                            value={tarea.Etiqueta}
                            onChange={(e) => handleInputChange(index, 'Etiqueta', e.target.value)}
                            placeholder='Etiqueta de Tarea'
                        />
                        <input type="text" value={tarea.Nombre} onChange={(e) => handleInputChange(index, 'Nombre', e.target.value)} placeholder='Nombre de la Tarea' />
                        <input type="text" value={tarea.Descripcion} onChange={(e) => handleInputChange(index, 'Descripcion', e.target.value)} placeholder='Descripcion de la Tarea' />
                        <input type="date" className='date' value={tarea.Fecha} onChange={(e) => handleInputChange(index, 'Fecha', e.target.value)} />
                        <input type="color" className='colorInput' value={tarea.Color} onChange={(e) => handleInputChange(index, 'Color', e.target.value)} list="color-datalist" />
                        <datalist id="color-datalist">
                            {colores.map((color, index) => (
                                <option key={index} value={color} />
                            ))}
                        </datalist>
                        <button className="paleta" onClick={() => addColor(index, tarea.Color)}><FontAwesomeIcon icon={faPalette} /></button>
                        <button className={`botonEstado ${tarea.Estado === 0 ? 'pendiente' : 'completado'}`} onClick={() => handleEstadoChange(index)}>
                            {tarea.Estado === 0 ?
                                <FontAwesomeIcon icon={faClock} /> :
                                <FontAwesomeIcon icon={faCheck} />
                            }
                        </button>
                        <button className="botonEliminar" onClick={() => handleDelete2(index)}>
                            <FontAwesomeIcon icon={faTrash} />
                        </button>
                    </div>
                ))
                ) : ( /**CONTENEDOR DE TAREAS  */
                    tareas.length > 0 ? (
                        tareasOrdenadas.map((tarea, index) => {
                            const separador = index === 0 || tareasOrdenadas[index - 1].Fecha !== tarea.Fecha ?
                                <div className='fecha'>{new Date(tarea.Fecha).toLocaleDateString('es-ES')} <hr /></div> : null;
                            return (
                                <React.Fragment key={index}>
                                    {separador}
                                    <div className='mostrarTareas'>
                                        <input type="time" className='time' value={tarea.HoraInicio} onChange={(e) => handleInputChange(index, 'HoraInicio', e.target.value)} />
                                        <input type="time" className='time' value={tarea.HoraFin} onChange={(e) => handleInputChange(index, 'HoraFin', e.target.value)} />
                                        <input
                                            type="text"
                                            className='etiqueta'
                                            value={tarea ? tarea.Etiqueta : ''}
                                            onChange={(e) => handleInputChange(index, 'Etiqueta', e.target.value)}
                                            placeholder='Etiqueta de Tarea'
                                        />
                                        <input type="text" value={tarea.Nombre} onChange={(e) => handleInputChange(index, 'Nombre', e.target.value)} placeholder='Nombre de la Tarea' />
                                        <input type="text" value={tarea.Descripcion} onChange={(e) => handleInputChange(index, 'Descripcion', e.target.value)} placeholder='Descripcion de la Tarea' />
                                        <input type="date" className='date' value={tarea.Fecha} onChange={(e) => handleInputChange(index, 'Fecha', e.target.value)} />
                                        <input type="color" className='colorInput' value={tarea.Color} onChange={(e) => handleInputChange(index, 'Color', e.target.value)} list="color-datalist" />
                                        <datalist id="color-datalist">
                                            {colores.map((color, index) => (
                                                <option key={index} value={color} />
                                            ))}
                                        </datalist>
                                        <button className="paleta" onClick={() => addColor(index, tarea.Color)} title='Guardar color'><FontAwesomeIcon icon={faPalette} /></button>
                                        <button className={`botonEstado ${tarea.Estado === 0 ? 'pendiente' : 'completado'}`} onClick={() => handleEstadoChange(index)}>
                                            {tarea.Estado === 0 ?
                                                <FontAwesomeIcon icon={faClock} /> :
                                                <FontAwesomeIcon icon={faCheck} />
                                            }
                                        </button>
                                        <button className="botonEliminar" onClick={() => handleDelete(index)}>
                                            <FontAwesomeIcon icon={faTrash} />
                                        </button>
                                    </div>
                                </React.Fragment>
                            );
                        })

                    ) : (
                        <h3 className="alerta alerta-info">No hay tareas asignadas.</h3>
                    ))}
            </div>
        </div>
    )
}