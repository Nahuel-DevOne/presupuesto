// variables y selectores
const formulario = document.querySelector('#agregar-gasto');
const gastoListado = document.querySelector('#gastos ul');

// eventos
function eventListeners() {
    document.addEventListener('DOMContentLoaded', preguntarPresupuesto);
    formulario.addEventListener('submit', agregarGasto);
}
eventListeners();

// Clases
class Presupuesto{
    constructor(presupuesto) {
        this.presupuesto = Number(presupuesto);
        this.restante = Number(presupuesto);
        this.gastos = [];
    }
    nuevoGasto(gasto) {
        // this para referenciar atributos dentro del mismo objeto
        // tomamos una copia del arreglo de gastos y le agregamos el nuevo gasto
        this.gastos = [...this.gastos, gasto];
        this.calcularRestante();
    }

    // metodo para ir restando del presupuesto actual
    calcularRestante() {
        const gastado = this.gastos.reduce((total, gasto) => total + gasto.cantidad, 0);
        this.restante = this.presupuesto - gastado;
    }

    // eliminar gasto del objeto
    eliminarGasto(id) {
        // creando un nuevo arreglo con los gastos que no tengan el id que se pasa por parametro
        this.gastos = this.gastos.filter(gasto => gasto.id !== id);
        this.calcularRestante();
    }

}

class UI{
    insertarPresupuesto(cantidad){
        // extraer valor
        const {presupuesto, restante} = cantidad;
        // agregar al html
        document.querySelector('#total').textContent = presupuesto;
        document.querySelector('#restante').textContent = restante;
    }

    imprimirAlerta(mensaje, tipo){
        // crear el div
        const divMensaje = document.createElement('div');
        divMensaje.classList.add('text-center', 'alert');

        if(tipo === 'error'){
            divMensaje.classList.add('alert-danger');
        } else {
            divMensaje.classList.add('alert-success');
        }
        // mensaje de error
        divMensaje.textContent = mensaje;
        // insertar en el html
        document.querySelector('.primario').insertBefore(divMensaje, formulario);

        // quitar el html
        setTimeout(() => {
            divMensaje.remove();
        }, 3000);
    }

    mostrarGastos(gastos){
        // elimina el html previo
        this.limpiarHTML();
        // iterar sobre los gastos
        gastos.forEach(gasto => {
            const {nombre, cantidad, id} = gasto;
            // crear un li
            const nuevoGasto = document.createElement('li');
            // agregando clases a la etiqueta li creada y guardada en la variable nuevoGasto
            nuevoGasto.className = 'list-group-item d-flex justify-content-between align-items-center';
            // agregar el id
            /**versión anterior */
            // nuevoGasto.setAttribute('data-id', id);
            /**versión nueva */
            nuevoGasto.dataset.id = id;
            // agregar el html del gasto
            nuevoGasto.innerHTML = `${nombre} <span class="badge badge-primary badge-pill"> $ ${cantidad} </span>`;
            // boton para borrar el gasto
            const btnBorrar = document.createElement('button');
            // agregando clases, otra opción a className
            btnBorrar.classList.add('btn', 'btn-danger', 'borrar-gasto');
            // agregando texto al boton, y usando entidades html
            // si usara textContent, no se vería el icono, tiene que ser innerHTML
            btnBorrar.innerHTML = 'Borrar &times;';
            // agregando onClick al btnBorrar para borrar según el id
            btnBorrar.onclick = () => {
                eliminarGasto(id);
            }
            nuevoGasto.appendChild(btnBorrar);
            // agregar al html
            gastoListado.appendChild(nuevoGasto);
        });
    }

    limpiarHTML(){
        // forma lenta
        // gastoListado.innerHTML = '';
        // forma rápida
        while(gastoListado.firstChild){
            gastoListado.removeChild(gastoListado.firstChild);
        }
    }

    actualizarRestante(restante){
        document.querySelector('#restante').textContent = restante;
    }

    comprobarPresupuesto(presupuestoObj){
        const {presupuesto, restante} = presupuestoObj;
        const restanteDiv = document.querySelector('.restante');
        // comprobar 25%
        // ya gastó más del 75%
        if((presupuesto / 4) > restante){
            restanteDiv.classList.remove('alert-success', 'alert-warning');
            restanteDiv.classList.add('alert-danger');
        // comprobar el 50%, ya gastó más del 50%    
        } else if((presupuesto / 2) > restante){
            restanteDiv.classList.remove('alert-success');
            restanteDiv.classList.add('alert-warning');
        // si el presupuesto es mayor al 50%, todavía no gastó el 50%    
        } else {
            restanteDiv.classList.remove('alert-danger', 'alert-warning');
            restanteDiv.classList.add('alert-success');
        }

        // si el total es 0 o menor
        if(restante <= 0){
            ui.imprimirAlerta('El presupuesto se ha agotado', 'error');
            formulario.querySelector('button[type="submit"]').disabled = true;
        }
    }

}


// Instanciar
const ui = new UI();
let presupuesto;

// funciones
function preguntarPresupuesto() {
    const presupuestoUsuario = prompt('¿Cuál es tu presupuesto?');
    // console.log(Number(presupuestoUsuario));
    // Validando la entrada del usuario
    if(presupuestoUsuario === '' || presupuestoUsuario === null || isNaN(presupuestoUsuario) || presupuestoUsuario <= 0) {
        //para recargar la ventana actual
        window.location.reload();
    }
    // Presupuesto valido
    presupuesto = new Presupuesto(presupuestoUsuario);
    // console.log(presupuesto);

    ui.insertarPresupuesto(presupuesto);

}

// Agrega gastos
function agregarGasto(e) {
    e.preventDefault();
    // leer los datos del formulario
    const nombre = document.querySelector('#gasto').value;
    const cantidad = Number(document.querySelector('#cantidad').value);
    // Validar
    if(nombre === '' || cantidad === '') {
        ui.imprimirAlerta('Ambos campos son obligatorios', 'error');
        return;
    } else if(cantidad <= 0 || isNaN(cantidad)) {
        ui.imprimirAlerta('Cantidad no válida', 'error');
        return;
    }
    
    // Generar un objeto con el gasto (Object literal enhancement)
    const gasto = { nombre, cantidad, id: Date.now() }
    // Añade un nuevo gasto
    presupuesto.nuevoGasto(gasto);
    // Mensaje de gasto agregado correctamente
    ui.imprimirAlerta('Gasto agregado correctamente');
    // aplicando destructuring
    const { gastos, restante } = presupuesto;
    // Imprimir los gastos
    ui.mostrarGastos(gastos);
    // Actualizar el restante
    ui.actualizarRestante(restante);
    // Comprobar el presupuesto
    ui.comprobarPresupuesto(presupuesto);
    // Reinicia el formulario
    formulario.reset();
}

function eliminarGasto(id){
    // Elimina los gastos del objeto
    presupuesto.eliminarGasto(id);
    // Elimina los gastos del html
    const { gastos, restante } = presupuesto;
    // Imprimir los gastos
    ui.mostrarGastos(gastos);
    // Actualizar el restante
    ui.actualizarRestante(restante);
    // Comprobar el presupuesto
    ui.comprobarPresupuesto(presupuesto);
}