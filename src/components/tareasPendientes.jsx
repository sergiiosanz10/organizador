import React from 'react';
import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClock, faTrash, faCheck } from '@fortawesome/free-solid-svg-icons'

export default function Pendientes() {
    const [tareas, setTareas] = useState([]);

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

    //MOSTRAR TAREAS
    useEffect(() => {
        const userId = localStorage.getItem('userId');
        fetch(`http://localhost/pendientes.php?userId=${userId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Conexión rechazada por el servidor. Intente más tarde.');
                }
                return response.json();
            })
            .then(data => setTareas(data))
            .catch(error => {
                console.error('Hubo un problema al mostrar las tareas:', error);
            });
    }, []);

    //CAMBIAR ESTADO DE TAREA ##########################################
    const URL_MODIESTADO = "http://localhost/modiEstado.php";

    const handleEstadoChange = async (index) => {
        const newTareas = [...tareas];
        newTareas[index].Estado = newTareas[index].Estado === 0 ? 1 : 0;
        setTareas(newTareas);

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

    const URL_MODITAREA = "http://localhost/modiTarea.php";

    const handleInputChange = async (index, field, value) => {
        const newTareas = [...tareas];
        newTareas[index][field] = value;
        setTareas(newTareas);

        // Actualiza la tarea en la base de datos
        const tarea = newTareas[index];
        const data = {
            "tareaId": tarea.tareaId,
            "nombre": tarea.Nombre,
            "descripcion": tarea.Descripcion,
            "horaInicio": tarea.HoraInicio,
            "horaFin": tarea.HoraFin,
            "fecha": tarea.Fecha
        };
        await enviarData(URL_MODITAREA, data);
    };

    //####################################################################

    //################### ELIMINAR TAREA #################################
    const URL_DELETETAREA = "http://localhost/eliminarTareas.php";
    const userId = localStorage.getItem('userId');
    const handleDelete = async (index) => {
        let newTareas = [...tareas];
        const tareaId = newTareas[index].tareaId;

        // Elimina la tarea de la base de datos
        const data = { "tareaId": tareaId };
        await enviarData(URL_DELETETAREA, data);

        // Solicita la lista actualizada de tareas al servidor
        fetch(`http://localhost/mostrarTareas.php?userId=${userId}`)
            .then(response => response.json())
            .then(data => setTareas(data));
    };
    //####################################################################

    //ORDENAR TAREAS POR FECHA y HORA

    const tareasOrdenadas = tareas.sort((a, b) => {
        const fechaHoraA = new Date(a.Fecha + 'T' + a.HoraInicio);
        const fechaHoraB = new Date(b.Fecha + 'T' + b.HoraInicio);
        return fechaHoraA - fechaHoraB;
    });

    //####################################################################



    return (
        <div>
            <div className="header">
                <h1 className='titulo' >Tareas Pendientes</h1>
            </div>
            <div className='tareasContainer'>
                {tareasOrdenadas.map((tarea, index) => {
                    const separador = index === 0 || tareasOrdenadas[index - 1].Fecha !== tarea.Fecha ?
                        <div className='fecha'>{new Date(tarea.Fecha).toLocaleDateString('es-ES')} <hr /></div> : null;
                    return (
                        <React.Fragment key={index}>
                            {separador}
                            <div className='mostrarTareas'>
                                <input type="time" value={tarea.HoraInicio} onChange={(e) => handleInputChange(index, 'HoraInicio', e.target.value)} />
                                <input type="time" value={tarea.HoraFin} onChange={(e) => handleInputChange(index, 'HoraFin', e.target.value)} />
                                <input type="text" value={tarea.Nombre} onChange={(e) => handleInputChange(index, 'Nombre', e.target.value)} />
                                <input type="text" value={tarea.Descripcion} onChange={(e) => handleInputChange(index, 'Descripcion', e.target.value)} />
                                <input type="date" value={tarea.Fecha} onChange={(e) => handleInputChange(index, 'Fecha', e.target.value)} />
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
                })}
            </div>
        </div>
    )
}