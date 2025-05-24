export default class AboutPage {
  async render() {
    return `
      <section class="about-page" aria-labelledby="about-title">
        <h1 id="about-title" class="content-title" tabindex="0">Tentang Story App</h1>
        
        <div class="about-content">
          <article class="about-card">
            <h2><i class="fas fa-info-circle"></i> Apa Itu Story App?</h2>
            <p>Aplikasi ini dibuat untuk memenuhi submission kelas <strong>Belajar Pengembangan Web Intermediate</strong> di Dicoding. Story App memungkinkan pengguna untuk:</p>
            <ul>
              <li>Berbagi cerita perjalanan</li>
              <li>Menambahkan lokasi peta</li>
              <li>Mengupload foto langsung dari kamera</li>
            </ul>
          </article>

          <article class="about-card">
            <h2><i class="fas fa-code"></i> Teknologi Yang Digunakan</h2>
            <div class="tech-stack">
              <div class="tech-item">
                <i class="fab fa-js-square"></i>
                <span>JavaScript ES6+</span>
              </div>
              <div class="tech-item">
                <i class="fab fa-html5"></i>
                <span>HTML5</span>
              </div>
              <div class="tech-item">
                <i class="fab fa-css3-alt"></i>
                <span>CSS3</span>
              </div>
              <div class="tech-item">
                <i class="fas fa-map-marked-alt"></i>
                <span>Leaflet Maps</span>
              </div>
            </div>
          </article>

          <article class="about-card">
            <h2><i class="fas fa-user-tie"></i> Tentang Pengembang</h2>
            <div class="developer-info">
              <img src="images/profile-placeholder.png" alt="Foto Developer" class="profile-img">
              <div>
                <h3>Naldi Pradipta</h3>
                <p>Front-End and Back-End Developer</p>
                <p>Dicoding Academy Student by Dbs Foundations</p>
                <div class="social-links">
                  <a href="#" aria-label="GitHub"><i class="fab fa-github"></i></a>
                  <a href="#" aria-label="LinkedIn"><i class="fab fa-linkedin"></i></a>
                </div>
              </div>
            </div>
          </article>
        </div>

        <div class="back-home">
          <a href="#/" class="btn btn-primary">
            <i class="fas fa-arrow-left"></i> Kembali ke Home
          </a>
        </div>
      </section>
    `;
  }

  async afterRender() {
    document.querySelector(".back-home a").focus();
  }
}
