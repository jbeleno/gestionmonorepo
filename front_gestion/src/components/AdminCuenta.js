import React, { useState, useEffect } from "react";
import "../styles/AdminCuenta.css";
import { useNavigate } from "react-router-dom";

const ESTADOS = [
  "Pago confirmado",
  "En preparación",
  "En domicilio",
  "Listo para recoger",
  "Entregado"
];

function AdminCuenta() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("productos");

  // Productos
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [nuevoProducto, setNuevoProducto] = useState({ nombre: "", descripcion: "", cantidad: 0, precio: 0, id_categoria: "", imagen_url: "" });
  const [editandoProducto, setEditandoProducto] = useState(null);
  const [productoEdit, setProductoEdit] = useState({});

  // Categorías
  const [nuevaCategoria, setNuevaCategoria] = useState({ nombre: "", descripcion_corta: "", descripcion_larga: "" });
  const [editandoCategoria, setEditandoCategoria] = useState(null);
  const [categoriaEdit, setCategoriaEdit] = useState({});

  // Pedidos
  const [pedidos, setPedidos] = useState([]);
  const [filtroEstado, setFiltroEstado] = useState("");
  const [verMasId, setVerMasId] = useState(null);
  const [detallesPedido, setDetallesPedido] = useState({});
  const [editandoEstadoId, setEditandoEstadoId] = useState(null);

  // Filtros
  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [filtroNombre, setFiltroNombre] = useState("");

  // Cerrar sesión
  const handleLogout = () => {
    localStorage.removeItem("usuario");
    navigate("/");
  };

  // Cargar datos iniciales
  useEffect(() => {
    fetch("http://127.0.0.1:8000/productos/").then(res => res.json()).then(setProductos);
    fetch("http://127.0.0.1:8000/categorias/").then(res => res.json()).then(setCategorias);
    fetch("http://127.0.0.1:8000/pedidos/").then(res => res.json()).then(setPedidos);
  }, []);

  // Filtrar pedidos por estado
  useEffect(() => {
    if (filtroEstado) {
      fetch(`http://127.0.0.1:8000/pedidos/estado/${filtroEstado}`).then(res => res.json()).then(setPedidos);
    } else {
      fetch("http://127.0.0.1:8000/pedidos/").then(res => res.json()).then(setPedidos);
    }
  }, [filtroEstado]);

  // CRUD Productos
  const handleCrearProducto = async e => {
    e.preventDefault();
    const res = await fetch("http://127.0.0.1:8000/productos/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nuevoProducto)
    });
    if (res.ok) {
      const prod = await res.json();
      setProductos([...productos, prod]);
      setNuevoProducto({ nombre: "", descripcion: "", cantidad: 0, precio: 0, id_categoria: "", imagen_url: "" });
    }
  };

  const handleActualizarProducto = async id => {
    const res = await fetch(`http://127.0.0.1:8000/productos/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(productoEdit)
    });
    if (res.ok) {
      const actualizado = await res.json();
      setProductos(productos.map(p => p.id_producto === id ? actualizado : p));
      setEditandoProducto(null);
      setProductoEdit({});
    }
  };

  const handleEditarClick = prod => {
    setEditandoProducto(prod.id_producto);
    setProductoEdit({
      nombre: prod.nombre,
      descripcion: prod.descripcion,
      cantidad: prod.cantidad,
      precio: prod.precio,
      id_categoria: prod.id_categoria,
      imagen_url: prod.imagen_url
    });
  };

  const handleEliminarProducto = async id => {
    await fetch(`http://127.0.0.1:8000/productos/${id}`, { method: "DELETE" });
    setProductos(productos.filter(p => p.id_producto !== id));
  };

  // CRUD Categorías
  const handleCrearCategoria = async e => {
    e.preventDefault();
    const res = await fetch("http://127.0.0.1:8000/categorias/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nuevaCategoria)
    });
    if (res.ok) {
      const cat = await res.json();
      setCategorias([...categorias, cat]);
      setNuevaCategoria({ nombre: "", descripcion_corta: "", descripcion_larga: "" });
    }
  };

  const handleEliminarCategoria = async id => {
    await fetch(`http://127.0.0.1:8000/categorias/${id}`, { method: "DELETE" });
    setCategorias(categorias.filter(c => c.id_categoria !== id));
  };

  const handleEditarCategoriaClick = cat => {
    setEditandoCategoria(cat.id_categoria);
    setCategoriaEdit({
      nombre: cat.nombre,
      descripcion_corta: cat.descripcion_corta,
      descripcion_larga: cat.descripcion_larga
    });
  };

  const handleActualizarCategoria = async id => {
    const res = await fetch(`http://127.0.0.1:8000/categorias/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(categoriaEdit)
    });
    if (res.ok) {
      const actualizada = await res.json();
      setCategorias(categorias.map(c => c.id_categoria === id ? actualizada : c));
      setEditandoCategoria(null);
      setCategoriaEdit({});
    }
  };

  // Actualizar estado de pedido
  const handleActualizarEstado = async (id_pedido, nuevoEstado) => {
    const pedido = pedidos.find(p => p.id_pedido === id_pedido);
    if (!pedido) return;
    const res = await fetch(`http://127.0.0.1:8000/pedidos/${id_pedido}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...pedido, estado: nuevoEstado })
    });
    if (res.ok) {
      setPedidos(pedidos.map(p => p.id_pedido === id_pedido ? { ...p, estado: nuevoEstado } : p));
    }
  };

  // Ver productos del pedido
  const handleVerMas = async (id_pedido) => {
    if (verMasId === id_pedido) {
      setVerMasId(null);
      return;
    }
    // Si ya tenemos los detalles, solo mostrar
    if (detallesPedido[id_pedido]) {
      setVerMasId(id_pedido);
      return;
    }
    // Obtener detalles y productos
    const detallesRes = await fetch(`http://127.0.0.1:8000/detalle_pedidos/`);
    const detallesAll = await detallesRes.json();
    const detalles = detallesAll.filter(d => d.id_pedido === id_pedido);
    // Obtener productos
    const productosRes = await fetch(`http://127.0.0.1:8000/pedidos/${id_pedido}/productos`);
    const productos = await productosRes.json();
    setDetallesPedido(prev => ({
      ...prev,
      [id_pedido]: detalles.map(det => ({
        ...det,
        producto: productos.find(p => p.id_producto === det.id_producto)
      }))
    }));
    setVerMasId(id_pedido);
  };

  return (
    <div className="admin-cuenta-container">
      <h2>Panel de administrador</h2>
      <button onClick={handleLogout} style={{float: 'right', marginTop: '-2.5rem', marginBottom: '1rem', background: '#d32f2f', color: '#fff', border: 'none', borderRadius: '6px', padding: '0.5rem 1.2rem', fontWeight: 'bold', cursor: 'pointer'}}>Cerrar sesión</button>
      <div className="admin-tabs">
        <button onClick={() => setTab("productos")} className={tab === "productos" ? "active" : ""}>Productos</button>
        <button onClick={() => setTab("categorias")} className={tab === "categorias" ? "active" : ""}>Categorías</button>
        <button onClick={() => setTab("pedidos")} className={tab === "pedidos" ? "active" : ""}>Pedidos</button>
      </div>

      {/* CRUD Productos */}
      {tab === "productos" && (
        <div>
          <h3>Productos</h3>
          <div className="admin-filtros-productos">
            <select
              value={filtroCategoria}
              onChange={e => setFiltroCategoria(e.target.value)}
              style={{padding: "0.5rem", borderRadius: "6px", border: "1.5px solid #6C3483"}}
            >
              <option value="">Todas las categorías</option>
              {categorias.map(cat => (
                <option key={cat.id_categoria} value={cat.id_categoria}>{cat.nombre}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Buscar por nombre..."
              value={filtroNombre}
              onChange={e => setFiltroNombre(e.target.value)}
              style={{padding: "0.5rem", borderRadius: "6px", border: "1.5px solid #6C3483", flex: "1 1 200px"}}
            />
          </div>
          <form onSubmit={handleCrearProducto} className="admin-form">
            <input value={nuevoProducto.nombre} onChange={e => setNuevoProducto({ ...nuevoProducto, nombre: e.target.value })} placeholder="Nombre" required />
            <input value={nuevoProducto.descripcion} onChange={e => setNuevoProducto({ ...nuevoProducto, descripcion: e.target.value })} placeholder="Descripción" required />
            <input type="number" value={nuevoProducto.cantidad} onChange={e => setNuevoProducto({ ...nuevoProducto, cantidad: Number(e.target.value) })} placeholder="Cantidad" required />
            <input type="number" value={nuevoProducto.precio} onChange={e => setNuevoProducto({ ...nuevoProducto, precio: Number(e.target.value) })} placeholder="Precio" required />
            <select value={nuevoProducto.id_categoria} onChange={e => setNuevoProducto({ ...nuevoProducto, id_categoria: Number(e.target.value) })} required>
              <option value="">Categoría</option>
              {categorias.map(cat => <option key={cat.id_categoria} value={cat.id_categoria}>{cat.nombre}</option>)}
            </select>
            <input value={nuevoProducto.imagen_url} onChange={e => setNuevoProducto({ ...nuevoProducto, imagen_url: e.target.value })} placeholder="URL Imagen" />
            <button type="submit">Crear producto</button>
          </form>
          <ul>
            {productos
              .filter(prod =>
                (!filtroCategoria || prod.id_categoria === Number(filtroCategoria)) &&
                (!filtroNombre || prod.nombre.toLowerCase().includes(filtroNombre.toLowerCase()))
              )
              .map(prod => (
                <li key={prod.id_producto} className="admin-producto-item">
                  <div className="admin-producto-info">
                    {editandoProducto === prod.id_producto ? (
                      <>
                        <input value={productoEdit.nombre} onChange={e => setProductoEdit({ ...productoEdit, nombre: e.target.value })} />
                        <input value={productoEdit.descripcion} onChange={e => setProductoEdit({ ...productoEdit, descripcion: e.target.value })} />
                        <input type="number" value={productoEdit.precio} onChange={e => setProductoEdit({ ...productoEdit, precio: Number(e.target.value) })} />
                        <input type="number" value={productoEdit.cantidad} onChange={e => setProductoEdit({ ...productoEdit, cantidad: Number(e.target.value) })} />
                        <input value={productoEdit.imagen_url} onChange={e => setProductoEdit({ ...productoEdit, imagen_url: e.target.value })} />
                        <select value={productoEdit.id_categoria} onChange={e => setProductoEdit({ ...productoEdit, id_categoria: Number(e.target.value) })}>
                          <option value="">Categoría</option>
                          {categorias.map(cat => <option key={cat.id_categoria} value={cat.id_categoria}>{cat.nombre}</option>)}
                        </select>
                        <button className="admin-btn-morado" onClick={() => handleActualizarProducto(prod.id_producto)}>Guardar</button>
                        <button className="admin-btn-morado" onClick={() => handleEliminarProducto(prod.id_producto)} style={{marginLeft: '0.7rem'}}>Eliminar</button>
                        <button onClick={() => setEditandoProducto(null)} style={{marginLeft: '0.7rem'}}>Cancelar</button>
                      </>
                    ) : (
                      <>
                        <div className="admin-producto-nombre"><b>{prod.nombre}</b></div>
                        <div className="admin-producto-desc">{prod.descripcion}</div>
                        <div className="admin-producto-precio">${prod.precio}</div>
                        <div className="admin-producto-stock">Stock: {prod.cantidad}</div>
                        <button className="admin-btn-morado" onClick={() => handleEditarClick(prod)}>Actualizar</button>
                      </>
                    )}
                  </div>
                  {prod.imagen_url && (
                    <div className="admin-producto-img">
                      <img src={prod.imagen_url} alt={prod.nombre} style={{maxWidth: '120px', maxHeight: '120px', borderRadius: '8px', objectFit: 'cover'}} />
                    </div>
                  )}
                </li>
              ))}
          </ul>
        </div>
      )}

      {/* CRUD Categorías */}
      {tab === "categorias" && (
        <div>
          <h3>Categorías</h3>
          <form onSubmit={handleCrearCategoria} className="admin-form">
            <input value={nuevaCategoria.nombre} onChange={e => setNuevaCategoria({ ...nuevaCategoria, nombre: e.target.value })} placeholder="Nombre" required />
            <input value={nuevaCategoria.descripcion_corta} onChange={e => setNuevaCategoria({ ...nuevaCategoria, descripcion_corta: e.target.value })} placeholder="Descripción corta" required />
            <input value={nuevaCategoria.descripcion_larga} onChange={e => setNuevaCategoria({ ...nuevaCategoria, descripcion_larga: e.target.value })} placeholder="Descripción larga" />
            <button type="submit">Crear categoría</button>
          </form>
          <ul>
            {categorias.map(cat => (
              <li key={cat.id_categoria} className="admin-categoria-item">
                {editandoCategoria === cat.id_categoria ? (
                  <div className="admin-categoria-info">
                    <input value={categoriaEdit.nombre} onChange={e => setCategoriaEdit({ ...categoriaEdit, nombre: e.target.value })} placeholder="Nombre" />
                    <input value={categoriaEdit.descripcion_corta} onChange={e => setCategoriaEdit({ ...categoriaEdit, descripcion_corta: e.target.value })} placeholder="Descripción corta" />
                    <input value={categoriaEdit.descripcion_larga} onChange={e => setCategoriaEdit({ ...categoriaEdit, descripcion_larga: e.target.value })} placeholder="Descripción larga" />
                    <div className="admin-categoria-botones">
                      <button className="admin-btn-morado" onClick={() => handleActualizarCategoria(cat.id_categoria)}>Guardar</button>
                      <button className="admin-btn-morado" onClick={() => handleEliminarCategoria(cat.id_categoria)}>Eliminar</button>
                      <button onClick={() => setEditandoCategoria(null)}>Cancelar</button>
                    </div>
                  </div>
                ) : (
                  <div className="admin-categoria-info">
                    <div className="admin-categoria-nombre"><b>{cat.nombre}</b></div>
                    <div className="admin-categoria-desc">{cat.descripcion_corta}</div>
                    <div className="admin-categoria-botones">
                      <button className="admin-btn-morado" onClick={() => handleEditarCategoriaClick(cat)}>Actualizar</button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Gestión de Pedidos */}
      {tab === "pedidos" && (
        <div>
          <h3>Pedidos</h3>
          <label>Filtrar por estado: </label>
          <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}>
            <option value="">Todos</option>
            {ESTADOS.map(estado => (
              <option key={estado} value={estado}>{estado}</option>
            ))}
          </select>
          <ul>
            {pedidos.map(pedido => (
              <li key={pedido.id_pedido} style={{marginBottom: '1.5rem'}}>
                <b>Pedido #{pedido.id_pedido}</b> - Estado: {pedido.estado}
                <button className="admin-btn-morado" style={{marginLeft: '1rem'}} onClick={() => setEditandoEstadoId(editandoEstadoId === pedido.id_pedido ? null : pedido.id_pedido)}>Actualizar</button>
                <button className="admin-btn-morado" style={{marginLeft: '0.7rem'}} onClick={() => handleVerMas(pedido.id_pedido)}>
                  {verMasId === pedido.id_pedido ? "Ocultar" : "Ver más"}
                </button>
                <span> | Cliente: {pedido.id_cliente} | Dirección: {pedido.direccion_envio} | Fecha: {pedido.fecha_pedido}</span>
                {editandoEstadoId === pedido.id_pedido && (
                  <div style={{marginTop: '0.7rem'}}>
                    <select value={pedido.estado} onChange={e => handleActualizarEstado(pedido.id_pedido, e.target.value)}>
                      {ESTADOS.map(estado => (
                        <option key={estado} value={estado}>{estado}</option>
                      ))}
                    </select>
                    <button style={{marginLeft: '0.7rem'}} onClick={() => setEditandoEstadoId(null)}>Cerrar</button>
                  </div>
                )}
                {verMasId === pedido.id_pedido && detallesPedido[pedido.id_pedido] && (
                  <div style={{marginTop: '1rem', background: '#f3e5f5', borderRadius: '8px', padding: '1rem'}}>
                    <b>Productos del pedido:</b>
                    <ul style={{marginTop: '0.7rem'}}>
                      {detallesPedido[pedido.id_pedido].map((det, idx) => (
                        <li key={det.id_detalle} style={{marginBottom: '0.5rem'}}>
                          <b>{det.producto?.nombre}</b> - {det.producto?.descripcion}<br/>
                          Valor unitario: ${det.producto?.precio} | Cantidad: {det.cantidad} | Subtotal: ${det.subtotal}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default AdminCuenta;
