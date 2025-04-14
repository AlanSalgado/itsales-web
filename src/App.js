import { useState, useEffect } from "react";

function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [token, setToken] = useState(null);
  const [csrf, setCsrf] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [newConnection, setNewConnection] = useState({
    server: "",
    instance: "",
    port: "",
    db_name: "",
    username: "",
    password: "",
  });

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const response = await fetch("http://172.16.4.16:3000/auth/home", {
        method: "GET",
        headers: {
          "Authorization": token ? `${token}` : "",
          "X-CSRF-Token": csrf ? csrf : "",
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      const data = await response.json();
      console.log("DATA DE SESION: ", data);
      if (response.ok) {
        setToken(data.token);
        setCsrf(data.csrf);
      } else {
        setToken(null);
        setCsrf(null);
      }
    } catch (error) {
      console.error("Error al verificar la sesión", error);
      setToken(null);
      setCsrf(null);
    }
  };

  const handleLogin = async () => {
    try {
      const response = await fetch("http://172.16.4.16:3000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          deviceInfo: "Enviando desde Opera GX, besto navegador",
        }),
        credentials: "include",
      });

      const data = await response.json();
      console.log("La data: ", data);
      if (response.ok) {
        setToken(data.token);
        setCsrf(data.csrf);
        setMessage("Inicio de sesión exitoso");
        // fetchConnections();
      } else {
        setMessage(data.message || "Error en el inicio de sesión");
      }
    } catch (error) {
      setMessage("Error en el servidor");
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch("http://172.16.4.16:3000/auth/logout", {
        method: "POST",
        headers: {
          "Authorization": `${token}`,
          "X-CSRF-Token": csrf,
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (response.ok) {
        setToken(null);
        setCsrf(null);
        setMessage("Sesión cerrada");
      } else {
        setMessage("Error al cerrar sesión");
      }
    } catch (error) {
      setMessage("Error en el servidor");
    }
  };

  const handleCreateConnection = async () => {
    try {
      const response = await fetch("http://172.16.4.16:3000/tenant/create", {
        method: "POST",
        headers: {
          "Authorization": `${token}`,
          "X-CSRF-Token": csrf,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newConnection),
        credentials: "include",
      });

      if (response.ok) {
        setMessage("Conexión creada correctamente");
        setShowModal(false);
        // fetchConnections();
      } else {
        setMessage("Error al crear conexión");
      }
    } catch (error) {
      setMessage("Error en el servidor");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-4">
          {token ? "Bienvenido" : "Iniciar Sesión"}
        </h2>

        {token ? (
          <>
            <button
              onClick={handleLogout}
              className="w-full bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
            >
              Cerrar Sesión
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="w-full mt-4 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
            >
              Agregar Conexión
            </button>
          </>
        ) : (
          <>
            <input
              type="email"
              placeholder="Correo Electrónico"
              className="w-full px-4 py-2 border rounded-md mb-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Contraseña"
              className="w-full px-4 py-2 border rounded-md mb-4"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              onClick={handleLogin}
              className="w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
            >
              Iniciar Sesión
            </button>
          </>
        )}
        {message && <p className="mt-4 text-center text-gray-700">{message}</p>}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-xl font-semibold mb-4">Nueva Conexión</h3>
            {Object.keys(newConnection).map((key) => (
              <input
                key={key}
                type="text"
                placeholder={key}
                value={newConnection[key]}
                onChange={(e) =>
                  setNewConnection({ ...newConnection, [key]: e.target.value })
                }
                className="w-full px-4 py-2 border rounded-md mb-2"
              />
            ))}
            <button
              onClick={handleCreateConnection}
              className="w-full bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
            >
              Guardar
            </button>
            <button
              onClick={() => setShowModal(false)}
              className="w-full mt-2 bg-gray-400 text-white px-4 py-2 rounded-md hover:bg-gray-500"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
