const pollito = document.getElementById('pollito');
const papas = document.getElementById('papas');
const clientId = 'n3ubpv4s4gd2msy2jtcpyzi0xk3cgq';
const redirectUri = 'https://localhost:8080/';

// Función para obtener las coordenadas del clic en relación con el documento
function getRelativeCoordinates(event) {
  const rect = pollito.getBoundingClientRect();
  const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const x = event.clientX - rect.left - scrollLeft;
  const y = event.clientY - rect.top - scrollTop;
  return { x, y };
}

// Función para mover el pollito al lugar donde se hizo clic
function movePollitoTo(x, y) {
  const desplazamientoX = 55; // Ajusta el valor para mover más o menos hacia la derecha
  const desplazamientoY = 40; // Ajusta el valor para mover más o menos hacia abajo

  const currentX = parseFloat(pollito.style.left) || 0;
  const currentY = parseFloat(pollito.style.top) || 0;

  const dx = x - currentX - pollito.offsetWidth / 2 + desplazamientoX;
  const dy = y - currentY - pollito.offsetHeight / 2 + desplazamientoY;

  pollito.style.left = currentX + dx + 'px';
  pollito.style.top = currentY + dy + 'px';
}

// Agregar el evento de clic al botón "Iniciar sesión con Twitch"
const loginButton = document.getElementById('login-button');
loginButton.addEventListener('click', () => {
  // Redirigir al usuario a la página de autorización de Twitch
  window.location.href = `https://id.twitch.tv/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=token`;
});

let accessToken;

// Obtener el token de acceso después de la redirección
if (window.location.hash) {
  const urlParams = new URLSearchParams(window.location.hash.substring(1));
  accessToken = urlParams.get('access_token');
}

// Agregar el evento de clic solo a la ventana para mover el pollito
window.addEventListener('click', (event) => {
  // Obtener las coordenadas del clic en relación con la ventana del navegador
  const x = event.clientX;
  const y = event.clientY;
  // Mover el pollito hacia las nuevas coordenadas
  movePollitoTo(x, y);
}, { passive: true }); // Agregar el atributo { passive: true } al evento click

let papasVisible = true;

// Mostrar las papas al cargar la página
showPapas();

// Función para mostrar las papas en lugares aleatorios
function showPapas() {
  if (papasVisible) {
    // Generar coordenadas aleatorias para posicionar las papas
    const maxX = window.innerWidth - papas.offsetWidth;
    const maxY = window.innerHeight - papas.offsetHeight;
    const randomX = Math.floor(Math.random() * maxX);
    const randomY = Math.floor(Math.random() * maxY);

    // Posicionar las papas en las coordenadas generadas
    papas.style.left = randomX + 'px';
    papas.style.top = randomY + 'px';

    // Mostrar las papas
    papas.style.display = 'block';
  }
}

// Agregar evento de 'mouseenter' al pollito para ocultar las papas cuando pase por encima
document.addEventListener('click', (event) => {
  // Verificar si el clic fue sobre las papas
  if (event.target === papas) {
    // Ocultar las papas y mostrar nuevas papas después de que el pollito las haya recogido
    if (papasVisible) {
      papas.style.display = 'none';
      papasVisible = false;
      setTimeout(() => {
        papasVisible = true;
        showPapas();
      }, 3000); // Esperar 3 segundos para mostrar las nuevas papas
    }
  }
});

// Función para obtener información del usuario autenticado usando el token de acceso
async function getUserInfo(accessToken) {
  try {
    const response = await fetch('https://api.twitch.tv/helix/users', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Client-ID': clientId
      }
    });

    if (!response.ok) {
      throw new Error('Error al obtener información del usuario');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
  }
}

// Llamar a la función para obtener información del usuario cuando tengas el token de acceso
if (accessToken) {
  getUserInfo(accessToken)
    .then((userData) => {
      console.log(userData);
      // Aquí puedes usar la información del usuario como lo necesites en tu extensión
    })
    .catch((error) => {
      console.error(error);
    });
}