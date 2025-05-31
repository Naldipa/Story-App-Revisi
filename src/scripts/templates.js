export function generateLoaderTemplate() {
  return `
    <div class="loader"></div>
  `;
}

export function generateLoaderAbsoluteTemplate() {
  return `
    <div class="loader loader-absolute"></div>
  `;
}

export function generateUnauthenticatedNavigationListTemplate() {
  return `
    <li><a href="javascript:void(0)" id="push-notification-tools" class="push-notification-tools"></a></li>
    <li><a id="login-button" href="#/login"><button class="btn-ghost">Login</button></a></li>
    <li><a id="register-button" href="#/register"><button class="btn">Register</button></a></li>
  `;
}

export function generateAuthenticatedNavigationListTemplate() {
  return `
    <li class="nav-list__right">
      <a href="#/bookmark" class="bookmark-button">
        <button class="nav-button">
          <i class="far fa-bookmark"></i> Saved story
        </button>
      </a>
      <a href="#/new" class="add-story-button">
        <button class="nav-button add-story-button">
          <i class="fas fa-plus"></i> Add Story
        </button>
      </a>
      <div id="push-notification-tools" class="push-notification-tools"></div>
      <a href="#/logout" class="logout-button">
        <button class="nav-button logout-button">
          <i class="fas fa-sign-out-alt"></i> Logout
        </button>
      </a>
    </li>
  `;
}
export function generateMainNavigationListTemplate() {
  return `
    <li><a id="report-list-button" class="report-list-button" href="#/">Daftar Laporan</a></li>
    <li><a id="bookmark-button" class="bookmark-button" href="#/bookmark">Laporan Tersimpan</a></li>
  `;
}

export function generateStoryItemTemplate({
  createdAt,
  description,
  id,
  lat,
  lon,
  name,
  photoUrl,
  placeName,
}) {
  return `
  <div id="${id}" class="story-item">
      <a href="#/story/${id}">
        <img src="${photoUrl}" alt="Story by ${name}" class="story-item__image"/>
        <div class="story-item__content">
          <h3 class="story-item__name">${name}</h3>
          <p class="story-item__description">${description}</p>
          <div class="story-item__meta">
            <span class="story-item__date">${new Date(
              createdAt
            ).toLocaleDateString()}</span>
            <span class="story-item__location">📍 ${
              placeName ? placeName : "Tidak diketahui"
            }</span>
          </div>
        </div>
      </a>
    </div>
  `;
}

export function generateStoriesListErrorTemplate(message) {
  return `
    <div id="story-list-error" class="story-list__error">
      <h2>Terjadi kesalahan pengambilan cerita</h2>
      <p>${
        message ? message : "Gunakan jaringan lain atau laporkan error ini."
      }</p>
    </div>
  `;
}

export function generateStoriesListEmptyTemplate() {
  return `
    <div id="story-list-empty" class="story-list__empty">
      <h2>Tidak ada cerita yang tersedia</h2>
      <p>Saat ini, tidak ada cerita yang bisa ditampilkan.</p>
    </div>
  `;
}

export function generateStoryDetailTemplate({
  createdAt,
  description,
  id,
  lat,
  lon,
  placeName,
  name,
  photoUrl,
}) {
  return `
    <div class="story-detail">
      <div class="story-detail__header">
        <img src="${photoUrl}" alt="Story by ${name}" class="story-detail__image">
        <h2 class="story-detail__title">${name}</h2>
        <p class="story-detail__date">${new Date(
          createdAt
        ).toLocaleString()}</p>
      </div>
      <div class="story-detail__content">
        <p class="story-detail__description">${description}</p>
        <div class="story-detail__meta">
          <p><strong>ID:</strong> ${id}</p>
          <p><strong>Location:</strong> ${
            placeName ? placeName : "Tidak Diketahui"
          }</p>
          <div id="save-actions-container" class="save-actions-container">
          </div>
        </div>
      </div>
      <div class="story-detail__body__map__container">
        <h2 class="story-detail__map__title">Lokasi</h2>
        <div class="story-detail__map__container">
          <div id="map" class="story-detail__map"></div>
          <div id="map-loading-container"></div>
        </div>
      </div>
    </div>
  `;
}

export function generateSubscribeButtonTemplate() {
  return `
    <button id="subscribe-button" class="nav-button subscribe-button">
      <i class="fas fa-bell"></i> Subscribe
    </button>
  `;
}

export function generateUnsubscribeButtonTemplate() {
  return `
    <button id="unsubscribe-button" class="nav-button unsubscribe-button">
      <i class="fas fa-bell-slash"></i> Unsubscribe
    </button>
  `;
}

export function generateSaveStoryButtonTemplate() {
  return `
    <button id="story-detail-save" class="story-detail-save btn btn-transparent">
      Save story <i class="far fa-bookmark"></i>
    </button>
  `;
}

export function generateRemoveStoryButtonTemplate() {
  return `
    <button id="story-detail-remove" class="btn btn-transparent story-detail-remove">
      Remove story <i class="fas fa-bookmark"></i>
    </button>
  `;
}
