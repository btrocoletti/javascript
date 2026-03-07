class Producto {
  constructor(name, id, type, price, stock, description) {
    this.name = name;
    this.id = id;
    this.type = type;
    this.price = price;
    this.stock = stock;
    this.description = description;
  }
}

// storage
function guardarEnStorage(clave, valor) {
  localStorage.setItem(clave, JSON.stringify(valor));
}

function cargarDeStorage(clave, valorPorDefecto) {
  return JSON.parse(localStorage.getItem(clave)) || valorPorDefecto;
}

// estado
let productos = [];
let carrito = cargarDeStorage("carrito", []);
let pedidos = cargarDeStorage("pedidos", []);

// utilidades
function mostrarToast(texto) {
  Toastify({
    text: texto,
    duration: 2000,
    gravity: "top",
    position: "right"
  }).showToast();
}

function obtenerItemCarrito(id) {
  return carrito.find((p) => p.id === id);
}

function totalCarrito() {
  return carrito.reduce((acc, { price, quantity }) => acc + price * quantity, 0);
}

function renderTotalCarrito() {
  const carritoTotal = document.getElementById("carritoTotal");
  carritoTotal.textContent = `Precio total: $ ${totalCarrito()}`;
}

function setMensaje(texto) {
  const msg = document.getElementById("carritoMsg");
  msg.textContent = texto;
}

function guardarCarrito() {
  guardarEnStorage("carrito", carrito);
  renderTotalCarrito();
}

// fetch de productos
async function cargarProductos() {
  try {
    const response = await fetch("./data/productos.json");

    if (!response.ok) {
      throw new Error("No se pudieron cargar los productos");
    }

    const data = await response.json();
    productos = data.map(
      (prod) =>
        new Producto(
          prod.name,
          prod.id,
          prod.type,
          prod.price,
          prod.stock,
          prod.description
        )
    );

    guardarEnStorage("productos", productos);
    renderizarProductos(productos);
  } catch (error) {
    setMensaje("Hubo un problema al cargar los productos.");
    console.error(error);
  }
}

// carrito
function agregarAlCarrito(producto, cantidadIngresada) {
  const cantidad = Number(cantidadIngresada);

  if (!Number.isFinite(cantidad) || cantidad <= 0) {
    setMensaje("Ingresá una cantidad válida mayor a 0.");
    return;
  }

  const existente = obtenerItemCarrito(producto.id);
  const cantidadActual = existente ? existente.quantity : 0;
  const nuevaCantidad = cantidadActual + cantidad;

  if (nuevaCantidad > producto.stock) {
    setMensaje(`Stock insuficiente. Disponible: ${producto.stock}. En carrito: ${cantidadActual}.`);
    return;
  }

  if (existente) {
    existente.quantity = nuevaCantidad;
  } else {
    carrito.push({ ...producto, quantity: cantidad });
  }

  setMensaje("Producto agregado al carrito.");
  mostrarToast("Producto agregado al carrito");
  guardarCarrito();
  renderizarCarrito();
}

function restarUnidad(idProducto) {
  const item = obtenerItemCarrito(idProducto);
  if (!item) return;

  if (item.quantity > 1) {
    item.quantity -= 1;
  } else {
    carrito = carrito.filter((p) => p.id !== idProducto);
  }

  setMensaje("Producto actualizado.");
  guardarCarrito();
  renderizarCarrito();
}

function eliminarProducto(idProducto) {
  carrito = carrito.filter((p) => p.id !== idProducto);
  setMensaje("Producto eliminado del carrito.");
  guardarCarrito();
  renderizarCarrito();
}

async function vaciarCarrito() {
  if (carrito.length === 0) {
    setMensaje("El carrito ya está vacío.");
    return;
  }

  const resultado = await Swal.fire({
    title: "¿Vaciar carrito?",
    text: "Se eliminarán todos los productos.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, vaciar",
    cancelButtonText: "Cancelar"
  });

  if (!resultado.isConfirmed) return;

  carrito = [];
  setMensaje("Carrito vacío.");
  guardarCarrito();
  renderizarCarrito();
  mostrarToast("Carrito vaciado");
}

// render carrito
function renderizarCarrito() {
  const listaCarrito = document.getElementById("listaCarrito");
  listaCarrito.innerHTML = "";

  if (carrito.length === 0) {
    const li = document.createElement("li");
    li.className = "carrito-item";
    li.innerHTML = `<div class="info"><div class="nombre">Tu carrito está vacío</div><div class="detalle">Agregá productos para continuar.</div></div>`;
    listaCarrito.appendChild(li);
    renderTotalCarrito();
    return;
  }

  for (const item of carrito) {
    const li = document.createElement("li");
    li.className = "carrito-item";

    const subtotal = item.price * item.quantity;

    li.innerHTML = `
      <div class="info">
        <div class="nombre">${item.name}</div>
        <div class="detalle">$ ${item.price} x ${item.quantity} = <strong>$ ${subtotal}</strong></div>
      </div>
      <div class="acciones">
        <button type="button" class="btn btn-sm btn-outline-secondary" aria-label="Restar una unidad">-</button>
        <button type="button" class="btn btn-sm btn-outline-secondary" aria-label="Sumar una unidad">+</button>
        <button type="button" class="btn btn-sm btn-outline-danger" aria-label="Eliminar producto">Eliminar</button>
      </div>
    `;

    const [btnMenos, btnMas, btnEliminar] = li.querySelectorAll("button");

    btnMenos.addEventListener("click", () => restarUnidad(item.id));
    btnEliminar.addEventListener("click", () => eliminarProducto(item.id));

    btnMas.addEventListener("click", () => {
      const prodCatalogo = productos.find((p) => p.id === item.id);
      if (!prodCatalogo) return;

      if (item.quantity + 1 > prodCatalogo.stock) {
        setMensaje(`Stock insuficiente. Disponible: ${prodCatalogo.stock}.`);
        return;
      }

      item.quantity += 1;
      setMensaje("Producto actualizado.");
      guardarCarrito();
      renderizarCarrito();
    });

    listaCarrito.appendChild(li);
  }

  renderTotalCarrito();
}

// render productos
function renderizarProductos(arrayUtilizado) {
  const contenedorProductos = document.getElementById("contenedorProductos");
  contenedorProductos.innerHTML = "";

  for (const prod of arrayUtilizado) {
    const { name, id, type, price, stock, description } = prod;

    const cardCol = document.createElement("div");
    cardCol.className = "col-12 col-sm-6 col-lg-3";

    const card = document.createElement("div");
    card.className = "card producto-card";
    card.id = id;

    const imgSrc = `./assets/${name + id}.png`;

    card.innerHTML = `
      <img src="${imgSrc}" class="card-img-top" alt="${name}">
      <div class="card-body">
        <h5 class="card-title">${name}</h5>
        <div class="producto-meta">${type}</div>
        <p class="card-text">${description}</p>
        <div class="d-flex justify-content-between align-items-center">
          <span class="producto-meta">Stock: ${stock}</span>
          <span class="producto-precio">$ ${price}</span>
        </div>

        <form class="producto-form" id="form${id}">
          <div>
            <label class="form-label mb-1" for="contador${id}">Cantidad</label>
            <input class="form-control" type="number" min="1" step="1" placeholder="1" id="contador${id}">
          </div>
          <button type="submit" class="btn btn-primary" id="botonProd${id}">Agregar</button>
        </form>
      </div>
    `;

    cardCol.appendChild(card);
    contenedorProductos.appendChild(cardCol);

    const imagen = card.querySelector("img");
    imagen.addEventListener("error", () => {
      imagen.src = "./assets/fallback.png";
    });

    const form = document.getElementById(`form${id}`);
    form.addEventListener("submit", (evento) => {
      evento.preventDefault();
      const contador = document.getElementById(`contador${id}`);
      agregarAlCarrito({ name, id, type, price, stock, description }, contador.value);
      form.reset();
    });
  }
}

// finalizar compra
async function finalizarCompra(event) {
  event.preventDefault();

  if (carrito.length === 0) {
    setMensaje("Tu carrito está vacío.");
    return;
  }

  const data = new FormData(event.target);
  const cliente = Object.fromEntries(data);

  const ticket = {
    cliente,
    total: totalCarrito(),
    id: pedidos.length + 1,
    productos: carrito,
    fecha: new Date().toISOString()
  };

  pedidos.push(ticket);
  guardarEnStorage("pedidos", pedidos);

  carrito = [];
  guardarCarrito();
  renderizarCarrito();
  event.target.reset();

  await Swal.fire({
    title: "Compra realizada",
    text: `Gracias por tu compra. Total: $ ${ticket.total}`,
    icon: "success",
    confirmButtonText: "Aceptar"
  });

  const carritoTotal = document.getElementById("carritoTotal");
  carritoTotal.textContent = "Muchas gracias por su compra, los esperamos pronto.";
  setMensaje("");
}

// ui
function configurarEventosUI() {
  const compraFinal = document.getElementById("formCompraFinal");
  compraFinal.addEventListener("submit", finalizarCompra);

  const selectorTipo = document.getElementById("tipoProducto");
  selectorTipo.addEventListener("change", (evt) => {
    const tipoSeleccionado = evt.target.value;

    if (tipoSeleccionado === "0") {
      renderizarProductos(productos);
    } else {
      renderizarProductos(productos.filter((p) => p.type === tipoSeleccionado));
    }
  });

  const btnVaciar = document.getElementById("btnVaciarCarrito");
  btnVaciar.addEventListener("click", vaciarCarrito);
}

// app
async function app() {
  configurarEventosUI();
  await cargarProductos();
  renderizarCarrito();
  renderTotalCarrito();
  setMensaje("");
}

app();
