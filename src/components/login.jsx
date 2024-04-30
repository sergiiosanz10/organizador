import "../styles/login.css";
import React, { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUser, faLock } from '@fortawesome/free-solid-svg-icons'

const URL_LOGIN = "https://taskify.sergiiosanz.es/login.php";
const URL_REGISTRO = "https://taskify.sergiiosanz.es/registrar.php";

const enviarData = async (url, data) => {

    const respuesta = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json'
        }
    })
    //console.log(respuesta);
    const json = await respuesta.json();
    //console.log(json);
    return json;
};
export default function Login(props) {

    //VISIBILIDAD DE LOS FORMULARIOS
    const [isLoginVisible, setLoginVisible] = useState(true);
    const handleClick = () => {
        setLoginVisible(!isLoginVisible);
    };
    //################################

    //LOGIN Y REGISTRO DE USUARIOS
    const refNombre = useRef(null);
    const refApellidos = useRef(null);
    const refUsuario = useRef(null);
    const refPassword = useRef(null);

    //PARA GUARDAR EL INICIO DE SESIÓN
    useEffect(() => {
        const userId = localStorage.getItem('userId');
        if (userId) {
            props.acceder(true);
        }
    }, [props]);
    //##################################################
    const handleLogin = async () => {
        const data = {
            "usuario": refUsuario.current.value,
            "password": refPassword.current.value
        };
        console.log(data);
        
        try {
            const respuestaJson = await enviarData(URL_LOGIN, data);
            console.log("Respuesta del servidor: ", respuestaJson);
    
            // Verifica si la respuesta es un objeto JSON válido
            if (respuestaJson && typeof respuestaJson === 'object' && respuestaJson.id) {
                localStorage.setItem('userId', respuestaJson.id);
                props.acceder(respuestaJson.isLogged);
            } else {
                console.error("La respuesta del servidor no es un objeto JSON válido:", respuestaJson);
            }
        } catch (error) {
            console.error("Error al manejar la respuesta del servidor:", error);
        }
    }

    const handleRegistro = async () => {
        const data = {
            "nombre": refNombre.current.value,
            "apellidos": refApellidos.current.value,
            "usuario": refUsuario.current.value,
            "password": refPassword.current.value,
        };
        console.log(data);
        const respuestaJson = await enviarData(URL_REGISTRO, data);
        console.log("Respuesta del servidor: ", respuestaJson);

        // Si el registro fue exitoso, muestra un alerta y luego inicia sesión automáticamente
        if (respuestaJson.isRegistered) {
            alert('Usuario registrado con éxito.');
            const loginData = {
                "usuario": data.usuario,
                "password": data.password
            };
            handleLogin(loginData);
        } else {
            alert('Hubo un problema al registrar el usuario.');
        }
    }

    //######################################################################
    return (
        <div>
            <span className="inicio"><span className='taski'>Taski</span>fy</span>
            {isLoginVisible ? (
                <div className="login">
                    <div className="row">
                        <div className="content" style={{ position: 'relative', zIndex: 1 }}>
                            <div className="card">
                                <div className="card-header">
                                    <h1>Iniciar sesión</h1>
                                </div>
                                <div className="card-body">
                                    <div className="input-group">
                                        <span className="input-group-text" id="basic-addon1">
                                            <FontAwesomeIcon icon={faUser} />
                                        </span>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Username"
                                            aria-label="Username"
                                            aria-describedby="basic-addon1"
                                            ref={refUsuario}
                                        />
                                    </div>
                                    <div className="input-group">
                                        <span className="input-group-text" id="basic-addon1">
                                            <FontAwesomeIcon icon={faLock} />
                                        </span>
                                        <input
                                            type="password"
                                            className="form-control"
                                            placeholder="Password"
                                            aria-label="Password"
                                            aria-describedby="basic-addon1"
                                            ref={refPassword}
                                        />
                                    </div>
                                    <div className="login-button">
                                        <button type="button" className="btn" onClick={handleLogin}>
                                            Iniciar sesión
                                        </button>
                                   
                                        <button type="button" className="btn" onClick={handleClick}>
                                            Registrarse
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <form id="registro" className="input-group" onSubmit={handleRegistro}>
                    <div className="row">
                        <div className="content">
                            <div className="card">
                                <div className="card-header">
                                    <h1 className="h1registro">Registro</h1>
                                </div>
                                <div className="card-body">
                                    <div className="input-group">
                                        <input id="nombre" className="form-control" type="text" placeholder=" Introduzca su nombre" ref={refNombre} required/>
                                    </div>
                                    <div className="input-group">
                                        <input id="apellidos" className="form-control" type="text" placeholder=" Introduzca sus apellidos" ref={refApellidos} required/>
                                    </div>
                                    <div className="input-group">
                                        <input id="usuario" className="form-control" type="text" placeholder=" Introduzca su usuario" ref={refUsuario} required/>
                                    </div>
                                    <div className="input-group">
                                        <input id="contraseña" className="form-control" type="password" placeholder=" Introduzca su contraseña" ref={refPassword} required/>
                                    </div>
                                    <div className="input-group">
                                        <input type="submit" id="botonregistro" className="btn" value="Registrarse" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            )}
        </div>
    );
}