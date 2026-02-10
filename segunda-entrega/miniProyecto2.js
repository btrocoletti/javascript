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

// Array de productos base
const productosBase = [
  { name: "Antipulgas Gato", id: "001", type: "Medicinal", price: 450, stock: 32, description: "Antipulgas felino Frontline Plus" },
  { name: "Antipulgas Perro", id: "002", type: "Medicinal", price: 480, stock: 25, description: "Antipulgas canino Frontline Plus" },
  { name: "Antiparasitario", id: "003", type: "Medicinal", price: 370, stock: 15, description: "Antiparasitario interno Oral Paraqueños" },
  { name: "Alimento Gato Joven", id: "004", type: "Alimento", price: 4530, stock: 18, description: "Alimento para gatos Kitten de Royal Canin" },
  { name: "Alimento Gato Adulto", id: "005", type: "Alimento", price: 5050, stock: 22, description: "Alimento para gatos Adulto de Royal Canin" },
  { name: "Alimento Gato Edad Avanzada", id: "006", type: "Alimento", price: 5350, stock: 14, description: "Alimento para gatos Senior de Royal Canin" },
  { name: "Alimento Perro Joven", id: "007", type: "Alimento", price: 6100, stock: 11, description: "Alimento para perros Puppy de Royal Canin" },
  { name: "Alimento Perro Adulto", id: "008", type: "Alimento", price: 6800, stock: 20, description: "Alimento para perros Adulto de Royal Canin" },
  { name: "Alimento Perro Edad Avanzada", id: "009", type: "Alimento", price: 7200, stock: 9, description: "Alimento para perros Senior de Royal Canin" },
  { name: "Juguete de Ratón", id: "010", type: "Juguete", price: 300, stock: 40, description: "Juguete de ratón con catnip" },
  { name: "Hueso Comestible", id: "011", type: "Juguete", price: 520, stock: 30, description: "Hueso comestible para perros" },
  { name: "Pelota", id: "012", type: "Juguete", price: 210, stock: 9, description: "Pelota plástica hipoalergénica chillona (12 cm)" },
];

// storage
function guardarEnStorage(clave, valor) {
  localStorage.setItem(clave, JSON.stringify(valor));
}

function cargarDeStorage(clave, valorPorDefecto) {
  return JSON.parse(localStorage.getItem(clave)) || valorPorDefecto;
}

// Estado de poro
let productos = cargarDeStorage("productos", []);
let carrito = cargarDeStorage("carrito", []);
let pedidos = cargarDeStorage("pedidos", []);

//  catálogo 
function agregarProductoCatalogo({ name, id, type, price, stock, description }) {
  if (productos.some((prod) => prod.id === id)) return;
  const productoNuevo = new Producto(name, id, type, price, stock, description);
  productos.push(productoNuevo);
  guardarEnStorage("productos", productos);
}

function cargarProductosPreexistentes() {
  if (productos.length > 0) return;
  for (const prod of productosBase) {
    const copia = JSON.parse(JSON.stringify(prod));
    agregarProductoCatalogo(copia);
  }
}

//  Carrito funcionando suma y resta 
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

function vaciarCarrito() {
  carrito = [];
  setMensaje("Carrito vacío.");
  guardarCarrito();
  renderizarCarrito();
}

//  Render del carrito 
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

//  Render de productos 
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
      <img src="${imgSrc}" class="card-img-top" alt="${name}" onerror="this.src='./assets/fallback.png'">
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

    const form = document.getElementById(`form${id}`);
    form.addEventListener("submit", (evento) => {
      evento.preventDefault();
      const contador = document.getElementById(`contador${id}`);
      agregarAlCarrito({ name, id, type, price, stock, description }, contador.value);
      form.reset();
    });
  }
}

// Finalizar compra 
function finalizarCompra(event) {
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
    fecha: new Date().toISOString(),
  };

  pedidos.push(ticket);
  guardarEnStorage("pedidos", pedidos);

  vaciarCarrito();
  event.target.reset();

  const carritoTotal = document.getElementById("carritoTotal");
  carritoTotal.textContent = "Muchas gracias por su compra, los esperamos pronto.";
}

//  UI 
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

//  App 
function app() {
  cargarProductosPreexistentes();
  configurarEventosUI();
  renderizarProductos(productos);
  renderizarCarrito();
  renderTotalCarrito();
  setMensaje("");
}

// Ejecutar
app();
