// ------------------------------
// IMPORTS
// ------------------------------
import { db, auth } from '../../firebase-config.js';
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  getDocs,
  collection,
  deleteDoc,
  serverTimestamp,
  addDoc
} from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";
import { onSnapshot } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";

// ------------------------------
// AUTHENTICATION & INITIAL SETUP
// ------------------------------
onAuthStateChanged(auth, user => {
  if (user) {
    document.getElementById('login-section').style.display = 'none';
    document.getElementById('content-editor').style.display = 'block';
    loadSiteContentEditors(); // Varsayılan sekme
    setupAdminNav();
    initMessageCountListener();
  } else {
    document.getElementById('login-section').style.display = 'block';
    document.getElementById('content-editor').style.display = 'none';
  }
});

function initMessageCountListener() {
  const messagesCollection = collection(db, 'contact_messages');
  onSnapshot(messagesCollection, (snapshot) => {
    document.getElementById('messagesCount').textContent = snapshot.size;
  });
}

window.adminLogin = async function() {
  const email = document.getElementById('admin-email').value;
  const password = document.getElementById('admin-password').value;
  try {
    await signInWithEmailAndPassword(auth, email, password);
    document.getElementById('login-section').style.display = 'none';
    document.getElementById('content-editor').style.display = 'block';
    loadSiteContentEditors();
    setupAdminNav();
  } catch (error) {
    alert('Giriş hatası: ' + error.message);
  }
};

window.logoutAdmin = async function() {
  await signOut(auth);
  document.getElementById('login-section').style.display = 'block';
  document.getElementById('content-editor').style.display = 'none';
};

// ------------------------------
// NAVIGATION
// ------------------------------
function setupAdminNav() {
  const navLinks = document.querySelectorAll('.admin-nav a');
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      navLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      
      const panel = link.getAttribute('data-panel');
      if (panel === 'site-content') {
        loadSiteContentEditors();
      } else if (panel === 'faq') {
        loadFAQEditor();
      } else if (panel === 'blogs') {
        loadBlogs();
      } else if (panel === 'messages') {
        loadMessages();
      } else if (panel === 'hakkimizda') {
        loadHakkimizdaEditor();
      } else if (panel === 'features') {
        loadFeaturesEditor();
      }
    });
  });
}

// ------------------------------
// BLOG IMAGE UPLOAD (Yeni blog resmi)
// ------------------------------
async function uploadBlogImage(file) {
  // Convert the file to a Base64 string and return it
  return await convertFileToBase64(file);
}

function convertFileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}

// ------------------------------
// FEATURES SECTION
// ------------------------------
async function loadFeaturesEditor() {
  try {
    showLoader();
    let featuresData = await getContentSection('features');
    if (!featuresData) {
      await setDoc(doc(db, 'site_content', 'features'), {
        title: "Özellikler",
        description: "Sunucularımızın öne çıkan özellikleri ve teknolojik altyapısı",
        items: [
          { icon: "fas fa-rocket", title: "Hızlı Kurulum", description: "Anında ve güvenli sunucu kurulumu." },
          { icon: "fas fa-shield-alt", title: "Güvenlik", description: "Üst düzey güvenlik önlemleriyle koruma." },
          { icon: "fas fa-sync-alt", title: "Dinamik Güncellemeler", description: "Sürekli yenilenen ve gelişen sistemimiz." }
        ]
      });
      featuresData = await getContentSection('features');
    }
    const featuresEditorHTML = createFeaturesEditor(featuresData);
    document.getElementById('site-content-editor').innerHTML = `
      <div class="editor-container">
        <div class="editor-header">
          <h2>Özellikler Yönetimi</h2>
          <button onclick="logoutAdmin()" class="logout-btn">Çıkış Yap</button>
        </div>
        ${featuresEditorHTML}
      </div>
    `;
    document.getElementById('site-content-editor').style.display = 'block';
    document.getElementById('faq-editor').style.display = 'none';
    document.getElementById('messages-editor').style.display = 'none';
    document.getElementById('blogs-editor').style.display = 'none';
  } catch (error) {
    console.error("Error loading features editor:", error);
    alert("Özellikler yüklenirken hata: " + error.message);
  } finally {
    hideLoader();
  }
}

function createFeaturesEditor(data) {
  if (!data) return '';
  let itemsHTML = '';
  if (data.items && data.items.length > 0) {
    data.items.forEach((item, i) => {
      itemsHTML += `
        <div class="feature-item-editor">
          <h4>Özellik ${i + 1}</h4>
          <div class="form-group">
            <label for="feature-icon-${i}">İkon Sınıfı:</label>
            <input type="text" id="feature-icon-${i}" value="${item.icon}">
          </div>
          <div class="form-group">
            <label for="feature-title-${i}">Başlık:</label>
            <input type="text" id="feature-title-${i}" value="${item.title}">
          </div>
          <div class="form-group">
            <label for="feature-desc-${i}">Açıklama:</label>
            <textarea id="feature-desc-${i}">${item.description}</textarea>
          </div>
          <button type="button" class="update-btn" onclick="removeFeatureItem(${i})">Bu Özelliği Sil</button>
        </div>
      `;
    });
  }
  return `
    <div class="editor-section">
      <div class="form-group">
        <label for="features-title">Başlık:</label>
        <input type="text" id="features-title" value="${data.title}">
      </div>
      <div class="form-group">
        <label for="features-desc">Açıklama:</label>
        <textarea id="features-desc" rows="2">${data.description}</textarea>
      </div>
      ${itemsHTML}
      <button onclick="updateFeatures()" class="update-btn">Güncelle</button>
      <button onclick="addNewFeatureItem()" class="update-btn">Yeni Özellik Ekle</button>
    </div>
  `;
}

window.updateFeatures = async function() {
  try {
    const title = document.getElementById('features-title').value;
    const description = document.getElementById('features-desc').value;
    let items = [];
    const featureEditors = document.querySelectorAll('.feature-item-editor');
    featureEditors.forEach((editor, i) => {
      const icon = document.getElementById(`feature-icon-${i}`).value;
      const featureTitle = document.getElementById(`feature-title-${i}`).value;
      const featureDesc = document.getElementById(`feature-desc-${i}`).value;
      items.push({ icon, title: featureTitle, description: featureDesc });
    });
    await updateDoc(doc(db, 'site_content', 'features'), { title, description, items });
    alert('Özellikler güncellendi!');
  } catch (error) {
    console.error("Güncelleme hatası (Features):", error);
    alert("Özellikler güncelleme hatası: " + error.message);
  }
};

window.addNewFeatureItem = async function() {
  try {
    let featuresData = await getContentSection('features');
    if (!featuresData) return;
    if (!featuresData.items) featuresData.items = [];
    featuresData.items.push({
      icon: "fas fa-star",
      title: "Yeni Özellik",
      description: "Açıklama"
    });
    await updateDoc(doc(db, 'site_content', 'features'), { items: featuresData.items });
    alert("Yeni özellik eklendi!");
    loadFeaturesEditor();
  } catch (error) {
    console.error("Yeni özellik ekleme hatası:", error);
    alert("Yeni özellik eklenirken hata: " + error.message);
  }
};

window.removeFeatureItem = async function(index) {
  try {
    let featuresData = await getContentSection('features');
    if (!featuresData || !featuresData.items) return;
    featuresData.items.splice(index, 1);
    await updateDoc(doc(db, 'site_content', 'features'), { items: featuresData.items });
    alert("Özellik silindi!");
    loadFeaturesEditor();
  } catch (error) {
    console.error("Özellik silme hatası:", error);
    alert("Özellik silinirken hata: " + error.message);
  }
};

// ------------------------------
// HAKKIMIZDA SECTION
// ------------------------------
async function loadHakkimizdaEditor() {
  try {
    showLoader();
    const docRef = doc(db, 'pages', 'hakkimizda');
    const docSnap = await getDoc(docRef);
    let data = {};
    if (docSnap.exists()) {
      data = docSnap.data();
    } else {
      data = {
        hero: { title: "Küçük Ekipler, Büyük İşler", subtitle: "EXIUS ekibiyle tanışın ve birlikte neler başardığımızı öğrenin." },
        story: { heading: "Bizim Hikayemiz", content: "EXIUS, 2011 yılında ilk sunucu denemesine başladığında..." },
        team: { heading: "Ekibimizle Tanışın", members: [
          { role: "Kurucu", name: "Batuhan Tonga" },
          { role: "Geliştirme Lideri", name: "Enes Aklık" }
        ]}
      };
      await setDoc(docRef, data);
    }
    const editorHTML = `
      <div class="editor-container">
        <div class="editor-header">
          <h2>Hakkımızda Sayfası Yönetimi</h2>
          <button onclick="logoutAdmin()" class="logout-btn">Çıkış Yap</button>
        </div>
        <div class="editor-section">
          <h3>Hero Bölümü</h3>
          <div class="form-group">
            <label for="hakkimizda-hero-title">Başlık (HTML destekli):</label>
            <textarea id="hakkimizda-hero-title" rows="2">${data.hero.title}</textarea>
          </div>
          <div class="form-group">
            <label for="hakkimizda-hero-subtitle">Alt Başlık:</label>
            <textarea id="hakkimizda-hero-subtitle" rows="2">${data.hero.subtitle}</textarea>
          </div>
        </div>
        <div class="editor-section">
          <h3>Hikaye Bölümü</h3>
          <div class="form-group">
            <label for="hakkimizda-story-heading">Başlık:</label>
            <input type="text" id="hakkimizda-story-heading" value="${data.story.heading}">
          </div>
          <div class="form-group">
            <label for="hakkimizda-story-content">İçerik:</label>
            <textarea id="hakkimizda-story-content" rows="4">${data.story.content}</textarea>
          </div>
        </div>
        <div class="editor-section">
          <h3>Ekibimiz</h3>
          <div class="form-group">
            <label for="hakkimizda-team-heading">Başlık:</label>
            <input type="text" id="hakkimizda-team-heading" value="${data.team.heading}">
          </div>
          <div class="form-group" style="margin-top:20px">
            <label>Üyeler:</label>
            <div id="team-members-editor">
              ${data.team.members.map((member, i) => `
                <div class="team-member-editor">
                  <label>Üye ${i+1}</label>
                  <input type="text" id="member-role-${i}" placeholder="Rol" value="${member.role}">
                  <input type="text" id="member-name-${i}" placeholder="İsim" value="${member.name}">
                  <button type="button" onclick="removeTeamMember(${i})" class="update-btn">Sil</button>
                </div>
              `).join('')}
            </div>
            <button type="button" onclick="addTeamMember()" class="update-btn">Yeni Üye Ekle</button>
          </div>
        </div>
        <button onclick="updateHakkimizdaContent()" class="update-btn">Güncelle</button>
      </div>
    `;
    document.getElementById('site-content-editor').innerHTML = editorHTML;
    document.getElementById('site-content-editor').style.display = 'block';
    document.getElementById('faq-editor').style.display = 'none';
    document.getElementById('messages-editor').style.display = 'none';
    document.getElementById('blogs-editor').style.display = 'none';
  } catch (error) {
    console.error("Error loading hakkimizda editor:", error);
    alert("Hakkımızda içeriği yüklenirken hata oluştu: " + error.message);
  } finally {
    hideLoader();
  }
}

// ------------------------------
// SITE CONTENT EDITORS (Hero, Stats, Cards)
// ------------------------------
async function loadSiteContentEditors() {
  try {
    showLoader();
    await initializeSiteContent();
    const heroData  = await getContentSection('hero');
    const statsData = await getContentSection('stats');
    const cardsData = await getContentSection('cards');
    const heroEditorHTML  = createHeroEditor(heroData);
    const statsEditorHTML = createStatsEditor(statsData);
    const cardsEditorHTML = createCardsEditor(cardsData);
    document.getElementById('site-content-editor').innerHTML = `
      <div class="editor-container">
        <div class="editor-header">
          <h2>Site İçerik Yönetimi</h2>
          <button onclick="logoutAdmin()" class="logout-btn">Çıkış Yap</button>
        </div>
        ${heroEditorHTML}
        ${statsEditorHTML}
        ${cardsEditorHTML}
      </div>
    `;
    document.getElementById('site-content-editor').style.display = 'block';
    document.getElementById('faq-editor').style.display = 'none';
  } catch (error) {
    console.error("Error loading site content editors:", error);
    alert("İçerik yüklenirken bir hata oluştu: " + error.message);
  } finally {
    hideLoader();
  }
}

// ------------------------------
// BLOG SECTION
// ------------------------------
async function loadBlogs() {
  try {
    showLoader();
    await initializeSiteContent();
    const snapshot = await getDocs(collection(db, 'blogs'));
    let blogHTML = `
      <div class="editor-container">
        <div class="editor-header">
          <h2>Blog Yönetimi</h2>
          <button onclick="logoutAdmin()" class="logout-btn">Çıkış Yap</button>
        </div>
        <!-- CREATE NEW BLOG FORM -->
        <div class="editor-section">
          <h3>Yeni Blog Oluştur</h3>
          <div class="form-group">
            <label for="blog-title">Başlık:</label>
            <input type="text" id="blog-title" placeholder="Blog Başlığı" />
          </div>
          <div class="form-group">
            <label for="blog-excerpt">Özet:</label>
            <textarea id="blog-excerpt" rows="2" placeholder="Kısa özet"></textarea>
          </div>
          <div class="form-group">
            <label for="blog-content">İçerik:</label>
            <textarea id="blog-content" rows="5" placeholder="Tam blog içeriği"></textarea>
          </div>
          <div class="form-group">
            <label for="blog-image">Blog Resmi:</label>
            <input type="file" id="blog-image" accept="image/*" />
          </div>
          <button class="update-btn" onclick="createBlog()">Kaydet</button>
        </div>
        <!-- LIST EXISTING BLOGS -->
        <div class="editor-section">
          <h3>Mevcut Bloglar</h3>
    `;
    snapshot.forEach(docSnap => {
      const docId = docSnap.id;
      const data = docSnap.data();
      const title = data.title || "Untitled Blog";
      blogHTML += `
          <div class="card-item-editor">
            <h4>${title}</h4>
            <button class="update-btn" onclick="deleteBlog('${docId}')">Sil</button>
          </div>
      `;
    });
    blogHTML += `
        </div>
      </div>
    `;
    document.getElementById('blogs-editor').innerHTML = blogHTML;
    document.getElementById('blogs-editor').style.display = 'block';
    document.getElementById('site-content-editor').style.display = 'none';
    document.getElementById('faq-editor').style.display = 'none';
    document.getElementById('messages-editor').style.display = 'none';
  } catch (error) {
    console.error("Error loading blogs:", error);
    alert("Bloglar yüklenirken hata oluştu: " + error.message);
  } finally {
    hideLoader();
  }
}

async function loadMessages() {
  try {
    showLoader();
    const snapshot = await getDocs(collection(db, 'contact_messages'));
    document.getElementById('messagesCount').textContent = snapshot.size;
    let messagesHTML = `
      <div class="editor-container">
        <div class="editor-header">
          <h2>Gelen Mesajlar</h2>
          <button onclick="logoutAdmin()" class="logout-btn">Çıkış Yap</button>
        </div>
        <div class="messages-list">
    `;
    snapshot.forEach(docSnap => {
      const docId = docSnap.id;
      const data = docSnap.data();
      const name = data.name || "Belirtilmedi";
      const email = data.email || "Belirtilmedi";
      const message = data.message || "Mesaj yok";
      messagesHTML += `
        <div class="message-card">
          <h4>${name}</h4>
          <p>Email: ${email}</p>
          <p>Mesaj: ${message}</p>
          <button class="delete-msg-btn" onclick="deleteMessage('${docId}')">Sil</button>
        </div>
      `;
    });
    messagesHTML += `
        </div>
      </div>
    `;
    document.getElementById('messages-editor').innerHTML = messagesHTML;
    document.getElementById('site-content-editor').style.display = 'none';
    document.getElementById('faq-editor').style.display = 'none';
    document.getElementById('messages-editor').style.display = 'block';
  } catch (error) {
    console.error("Error loading messages:", error);
    alert("Mesajlar yüklenirken hata oluştu: " + error.message);
  } finally {
    hideLoader();
  }
}

// ------------------------------
// BLOG FUNCTIONS
// ------------------------------
window.createBlog = async function() {
  try {
    showLoader();
    const titleEl = document.getElementById('blog-title');
    const excerptEl = document.getElementById('blog-excerpt');
    const contentEl = document.getElementById('blog-content');
    const imageInput = document.getElementById('blog-image');
    let imagePath = "";
    if (imageInput && imageInput.files && imageInput.files[0]) {
      const file = imageInput.files[0];
      imagePath = await uploadBlogImage(file);
    }
    const newBlog = {
      title: titleEl.value,
      excerpt: excerptEl.value,
      content: contentEl.value,
      image: imagePath,
      createdAt: serverTimestamp()
    };
    await addDoc(collection(db, 'blogs'), newBlog);
    alert("Yeni blog eklendi!");
    loadBlogs();
  } catch (error) {
    console.error("createBlog error:", error);
    alert("Blog eklenirken hata: " + error.message);
  } finally {
    hideLoader();
  }
};

window.deleteBlog = async function(docId) {
  try {
    showLoader();
    await deleteDoc(doc(db, 'blogs', docId));
    alert("Blog silindi!");
    loadBlogs();
  } catch (error) {
    console.error("deleteBlog error:", error);
    alert("Blog silinirken hata: " + error.message);
  } finally {
    hideLoader();
  }
};

window.deleteMessage = async function(docId) {
  try {
    await deleteDoc(doc(db, 'contact_messages', docId));
    alert('Mesaj silindi!');
    loadMessages();
  } catch (error) {
    console.error('Mesaj silinirken hata:', error);
    alert('Mesaj silinirken hata: ' + error.message);
  }
};

// ------------------------------
// HAKKIMIZDA UPDATE
// ------------------------------
window.updateHakkimizdaContent = async function() {
  try {
    showLoader();
    const updatedData = {
      hero: {
        title: document.getElementById('hakkimizda-hero-title').value,
        subtitle: document.getElementById('hakkimizda-hero-subtitle').value
      },
      story: {
        heading: document.getElementById('hakkimizda-story-heading').value,
        content: document.getElementById('hakkimizda-story-content').value
      },
      team: {
        heading: document.getElementById('hakkimizda-team-heading').value,
        members: []
      }
    };
    const teamEditor = document.getElementById('team-members-editor');
    teamEditor.querySelectorAll('.team-member-editor').forEach((memberEl, i) => {
      const role = document.getElementById(`member-role-${i}`).value;
      const name = document.getElementById(`member-name-${i}`).value;
      updatedData.team.members.push({ role, name });
    });
    const docRef = doc(db, 'pages', 'hakkimizda');
    await updateDoc(docRef, updatedData);
    alert('Hakkımızda içeriği güncellendi!');
  } catch (error) {
    console.error('Hakkımızda güncelleme hatası:', error);
    alert('Güncelleme hatası: ' + error.message);
  } finally {
    hideLoader();
  }
};

window.addTeamMember = function() {
  const teamEditor = document.getElementById('team-members-editor');
  const index = teamEditor.children.length;
  const memberHTML = `
    <div class="team-member-editor">
      <label>Üye ${index + 1}</label>
      <input type="text" id="member-role-${index}" placeholder="Rol" value="">
      <input type="text" id="member-name-${index}" placeholder="İsim" value="">
      <button type="button" onclick="removeTeamMember(${index})">Sil</button>
    </div>
  `;
  teamEditor.insertAdjacentHTML('beforeend', memberHTML);
};

window.removeTeamMember = function(index) {
  const teamEditor = document.getElementById('team-members-editor');
  const memberBlock = teamEditor.querySelector(`#member-role-${index}`).closest('.team-member-editor');
  if (memberBlock) memberBlock.remove();
};

// ------------------------------
// FAQ SECTION
// ------------------------------
window.updateFAQ = async function() {
  try {
    const faqData = await getContentSection('faq');
    if (!faqData || !faqData.items) {
      alert("FAQ verisi bulunamadı. Lütfen önce oluşturun.");
      return;
    }
    let newItems = [];
    for (let i = 0; i < faqData.items.length; i++) {
      const question = document.getElementById(`faq-question-${i}`).value;
      const answer   = document.getElementById(`faq-answer-${i}`).value;
      newItems.push({ question, answer });
    }
    await updateDoc(doc(db, 'site_content', 'faq'), { items: newItems });
    alert('FAQ güncellendi!');
  } catch (error) {
    console.error('Güncelleme hatası (FAQ):', error);
    alert('FAQ güncelleme hatası: ' + error.message);
  }
};

window.removeFAQItem = async function(index) {
  try {
    const faqData = await getContentSection('faq');
    if (!faqData || !faqData.items) return;
    faqData.items.splice(index, 1);
    await updateDoc(doc(db, 'site_content', 'faq'), { items: faqData.items });
    alert('SSS Silindi!');
    loadFAQEditor();
  } catch (error) {
    console.error('removeFAQItem error:', error);
    alert('SSS silinirken hata: ' + error.message);
  }
};

window.addNewFAQItem = async function() {
  try {
    const faqData = await getContentSection('faq');
    if (!faqData || !faqData.items) return;
    faqData.items.push({
      question: "Yeni soru",
      answer: "Yeni cevap"
    });
    await updateDoc(doc(db, 'site_content', 'faq'), { items: faqData.items });
    alert('Yeni SSS eklendi!');
    loadFAQEditor();
  } catch (error) {
    console.error('addNewFAQItem error:', error);
    alert('Yeni SSS eklenirken hata: ' + error.message);
  }
};

window.createDefaultFAQ = async function() {
  try {
    const defaultData = {
      items: [
        {
          question: "Hizmetleriniz neler?",
          answer: "Profesyonel oyun sunucuları, altyapı ve 7/24 destek hizmetleri sunuyoruz."
        },
        {
          question: "Destek ekibiniz var mı?",
          answer: "Evet, uzman destek ekibimiz tüm gün hizmet vermektedir."
        },
        {
          question: "Fiyatlandırma nasıl?",
          answer: "Farklı paket seçenekleri sunuyoruz. Detaylı bilgi için bizimle iletişime geçin."
        }
      ]
    };
    await setDoc(doc(db, 'site_content', 'faq'), defaultData);
    alert('Varsayılan FAQ oluşturuldu!');
    loadFAQEditor();
  } catch (error) {
    console.error('createDefaultFAQ error:', error);
    alert('Varsayılan FAQ oluşturulurken hata: ' + error.message);
  }
};

function createFAQEditor(data) {
  if (!data) return `
    <div class="editor-section">
      <p>Henüz bir FAQ verisi bulunamadı.</p>
      <button onclick="createDefaultFAQ()" class="update-btn">Varsayılan FAQ Oluştur</button>
    </div>
  `;
  let faqItemsHTML = '';
  if (data.items) {
    data.items.forEach((item, i) => {
      faqItemsHTML += `
        <div class="card-item-editor">
          <h4>FAQ ${i + 1}</h4>
          <div class="form-group">
            <label for="faq-question-${i}">Soru:</label>
            <input type="text" id="faq-question-${i}" value="${item.question}">
          </div>
          <div class="form-group">
            <label for="faq-answer-${i}">Cevap:</label>
            <textarea id="faq-answer-${i}">${item.answer}</textarea>
          </div>
          <button type="button" class="update-btn" onclick="removeFAQItem(${i})">Bu SSS'yi Sil</button>
        </div>
      `;
    });
  }
  let socialHTML = '';
  if (!data.socialLinks) data.socialLinks = [];
  data.socialLinks.forEach((link, i) => {
    socialHTML += `
      <div class="card-item-editor">
        <h4>Sosyal Link ${i + 1}</h4>
        <div class="form-group">
          <label for="social-label-${i}">Label:</label>
          <input type="text" id="social-label-${i}" value="${link.label}">
        </div>
        <div class="form-group">
          <label for="social-url-${i}">URL:</label>
          <input type="text" id="social-url-${i}" value="${link.url}">
        </div>
        <button type="button" class="update-btn" onclick="removeSocialLink(${i})">Bu Linki Sil</button>
      </div>
    `;
  });
  return `
    <div class="editor-section">
      <h3>Sık Sorulan Sorular</h3>
      ${faqItemsHTML}
      <button onclick="updateFAQ()" class="update-btn">FAQ Güncelle</button>
      <button onclick="addNewFAQItem()" class="update-btn">Yeni SSS Ekle</button>
    </div>
    <div class="editor-section">
      <h3>Sosyal Linkler</h3>
      ${socialHTML}
      <button onclick="updateSocialLinks()" class="update-btn">Linkleri Güncelle</button>
      <button onclick="addNewSocialLink()" class="update-btn">Yeni Link Ekle</button>
    </div>
  `;
}

window.updateSocialLinks = async function() {
  try {
    const faqData = await getContentSection('faq');
    if (!faqData) return;
    let newLinks = [];
    if (faqData.socialLinks) {
      for (let i = 0; i < faqData.socialLinks.length; i++) {
        const label = document.getElementById(`social-label-${i}`).value;
        const url   = document.getElementById(`social-url-${i}`).value;
        newLinks.push({ label, url });
      }
    }
    await updateDoc(doc(db, 'site_content', 'faq'), { socialLinks: newLinks });
    alert('Sosyal Linkler güncellendi!');
    loadFAQEditor();
  } catch (error) {
    console.error('updateSocialLinks error:', error);
    alert('Sosyal linkler güncellenirken hata: ' + error.message);
  }
};

window.addNewSocialLink = async function() {
  try {
    const faqData = await getContentSection('faq');
    if (!faqData) return;
    if (!faqData.socialLinks) faqData.socialLinks = [];
    faqData.socialLinks.push({
      label: "New Link",
      url: "https://example.com"
    });
    await updateDoc(doc(db, 'site_content', 'faq'), { socialLinks: faqData.socialLinks });
    alert('Yeni Link Eklendi!');
    loadFAQEditor();
  } catch (error) {
    console.error('addNewSocialLink error:', error);
    alert('Yeni link eklenirken hata: ' + error.message);
  }
};

window.removeSocialLink = async function(index) {
  try {
    const faqData = await getContentSection('faq');
    if (!faqData || !faqData.socialLinks) return;
    faqData.socialLinks.splice(index, 1);
    await updateDoc(doc(db, 'site_content', 'faq'), { socialLinks: faqData.socialLinks });
    alert('Link Silindi!');
    loadFAQEditor();
  } catch (error) {
    console.error('removeSocialLink error:', error);
    alert('Link silinirken hata: ' + error.message);
  }
};

// ------------------------------
// INITIALIZE SITE CONTENT
// ------------------------------
async function initializeSiteContent() {
  // Initialize Hero
  let heroRef = doc(db, 'site_content', 'hero');
  let heroSnap = await getDoc(heroRef);
  if (!heroSnap.exists()) {
    await setDoc(heroRef, {
      title: "Geleceğin<br>Oyun Sunucularını İnşa Ediyoruz",
      description: "Tutkulu topluluklardan devasa 10.000+ oyunculu ekosistemlere kadar",
      buttonText: "Altyapıyı Keşfet"
    });
  }

  // Initialize Stats
  let statsRef = doc(db, 'site_content', 'stats');
  let statsSnap = await getDoc(statsRef);
  if (!statsSnap.exists()) {
    await setDoc(statsRef, {
      title: "İstatistikler",
      description: "Güçlü altyapımız ve yılların deneyimiyle, büyüyen oyuncu kitlesi ve %99.9 kesintisiz çalışma süresiyle performansımızı ortaya koyuyoruz.",
      items: [
        { number: "10+",  title: "Yıllık Deneyim" },
        { number: "10K+", title: "Günlük Oyuncu" },
        { number: "99.9%", title: "Çalışma Süresi" }
      ]
    });
  } else {
    let existingStatsData = statsSnap.data();
    if (!existingStatsData.items || existingStatsData.items.length !== 3) {
      let newStatsItems = [
        existingStatsData.items?.[0] || { number: "10+",  title: "Yıllık Deneyim" },
        existingStatsData.items?.[1] || { number: "10K+", title: "Günlük Oyuncu" },
        existingStatsData.items?.[2] || { number: "99.9%", title: "Çalışma Süresi" }
      ];
      await updateDoc(statsRef, { items: newStatsItems });
    }
  }

  // Initialize Cards
  let cardsRef = doc(db, 'site_content', 'cards');
  let cardsSnap = await getDoc(cardsRef);
  if (!cardsSnap.exists()) {
    await setDoc(cardsRef, {
      items: [
        { title: "Ultra Hızlı Sunucular", description: "Son teknoloji donanım ve optimize edilmiş ağ ile kesintisiz oyun deneyimi." },
        { title: "Ölçeklenebilir Altyapı", description: "Küçük topluluklardan 10.000+ oyunculu devasa ekosistemlere kadar destek." },
        { title: "7/24 Teknik Destek", description: "Uzman ekibimizle her an yanınızdayız, sorunları anında çözüyoruz." }
      ]
    });
  } else {
    let existingCardsData = cardsSnap.data();
    if (!existingCardsData.items || existingCardsData.items.length !== 3) {
      let newItems = [
        existingCardsData.items?.[0] || { title: "Card 1", description: "Açıklama 1" },
        existingCardsData.items?.[1] || { title: "Card 2", description: "Açıklama 2" },
        existingCardsData.items?.[2] || { title: "Card 3", description: "Açıklama 3" }
      ];
      await updateDoc(cardsRef, { items: newItems });
    }
  }

  // Initialize FAQ
  let faqRef = doc(db, 'site_content', 'faq');
  let faqSnap = await getDoc(faqRef);
  if (!faqSnap.exists()) {
    await setDoc(faqRef, {
      items: [
        {
          question: "Hizmetleriniz neler?",
          answer: "Profesyonel oyun sunucuları, altyapı ve 7/24 destek hizmetleri sunuyoruz."
        },
        {
          question: "Destek ekibiniz var mı?",
          answer: "Evet, uzman destek ekibimiz tüm gün hizmet vermektedir."
        },
        {
          question: "Fiyatlandırma nasıl?",
          answer: "Farklı paket seçenekleri sunuyoruz. Detaylı bilgi için bizimle iletişime geçin."
        }
      ],
      socialLinks: [
        { label: "Discord", url: "https://discord.gg/..." },
        { label: "Twitter", url: "https://twitter.com/..." },
        { label: "LinkedIn", url: "https://linkedin.com/..." }
      ]
    });
  } else {
    let existingFAQ = faqSnap.data();
    if (!existingFAQ.socialLinks) {
      existingFAQ.socialLinks = [
        { label: "Discord", url: "https://discord.gg/..." }
      ];
      await updateDoc(faqRef, { socialLinks: existingFAQ.socialLinks });
    }
  }

  // Initialize Hakkımızda
  let hakkimizdaRef = doc(db, 'pages', 'hakkimizda');
  let hakkimizdaSnap = await getDoc(hakkimizdaRef);
  if (!hakkimizdaSnap.exists()) {
    await setDoc(hakkimizdaRef, {
      hero: {
        title: "Küçük Ekipler, Büyük İşler",
        subtitle: "EXIUS ekibiyle tanışın ve birlikte neler başardığımızı öğrenin."
      },
      story: {
        heading: "Bizim Hikayemiz",
        content: "EXIUS, 2011 yılında ilk sunucu denemesine başladığında küçük bir toplulukla yola çıktı. Kısa sürede büyüyen bu topluluk, profesyonel oyun sunucuları kurma ve yönetme tutkumuzu harekete geçirdi."
      },
      team: {
        heading: "Ekibimizle Tanışın",
        members: [
          { role: "Kurucu", name: "Batuhan Tonga" },
          { role: "Geliştirme Lideri", name: "Enes Aklık" },
          { role: "Front-end Geliştirme", name: "Enes Bayraktar & Furkan Öztürk" },
          { role: "Back-end Geliştirme", name: "Muhammet Sanaga & Furkan Öztürk" }
        ]
      }
    });
  }
}



// ------------------------------
// SITE CONTENT EDITOR BUILDERS
// ------------------------------
function createHeroEditor(data) {
  if (!data) return '';
  return `
    <div class="editor-section">
      <h3>Hero Bölümü</h3>
      <div class="form-group">
        <label for="hero-title">Başlık (HTML destekli):</label>
        <textarea id="hero-title" rows="2">${data.title}</textarea>
      </div>
      <div class="form-group">
        <label for="hero-desc">Açıklama:</label>
        <textarea id="hero-desc">${data.description}</textarea>
      </div>
      <div class="form-group">
        <label for="hero-button">Buton Metni:</label>
        <input type="text" id="hero-button" value="${data.buttonText}">
      </div>
      <button onclick="updateHero()" class="update-btn">Güncelle</button>
    </div>
  `;
}

function createStatsEditor(data) {
  if (!data) return '';
  let itemsHTML = '';
  data.items.forEach((item, i) => {
    itemsHTML += `
      <div class="stat-item-editor">
        <h4>İstatistik ${i + 1}</h4>
        <div class="form-group">
          <label for="stat-number-${i}">Sayı:</label>
          <input type="text" id="stat-number-${i}" value="${item.number}">
        </div>
        <div class="form-group">
          <label for="stat-title-${i}">Başlık:</label>
          <input type="text" id="stat-title-${i}" value="${item.title}">
        </div>
      </div>
    `;
  });
  return `
    <div class="editor-section">
      <h3>İstatistikler</h3>
      <div class="form-group">
        <label for="stats-title">Başlık:</label>
        <input type="text" id="stats-title" value="${data.title}">
      </div>
      <div class="form-group">
        <label for="stats-desc">Açıklama:</label>
        <textarea id="stats-desc">${data.description}</textarea>
      </div>
      ${itemsHTML}
      <button onclick="updateStats()" class="update-btn">Güncelle</button>
    </div>
  `;
}

function createCardsEditor(data) {
  if (!data) return '';
  let cardsHTML = '';
  data.items.forEach((item, i) => {
    cardsHTML += `
      <div class="card-item-editor">
        <h4>Kart ${i + 1}</h4>
        <div class="form-group">
          <label for="card-title-${i}">Başlık:</label>
          <input type="text" id="card-title-${i}" value="${item.title}">
        </div>
        <div class="form-group">
          <label for="card-desc-${i}">Açıklama:</label>
          <textarea id="card-desc-${i}">${item.description}</textarea>
        </div>
      </div>
    `;
  });
  return `
    <div class="editor-section">
      <h3>Kartlar (3 Adet)</h3>
      ${cardsHTML}
      <button onclick="updateCards()" class="update-btn">Güncelle</button>
    </div>
  `;
}

// ------------------------------
// UPDATE FUNCTIONS (Hero, Stats, Cards)
// ------------------------------
window.updateHero = async function() {
  const newData = {
    title: document.getElementById('hero-title').value,
    description: document.getElementById('hero-desc').value,
    buttonText: document.getElementById('hero-button').value
  };
  try {
    await updateDoc(doc(db, 'site_content', 'hero'), newData);
    alert('Hero bölümü güncellendi!');
  } catch (error) {
    console.error('Güncelleme hatası (Hero):', error);
    alert('Güncelleme hatası: ' + error.message);
  }
};

window.updateStats = async function() {
  try {
    const statsData = await getContentSection('stats');
    if (!statsData || !statsData.items) return;
    let newItems = [];
    for (let i = 0; i < statsData.items.length; i++) {
      const number = document.getElementById(`stat-number-${i}`).value;
      const title = document.getElementById(`stat-title-${i}`).value;
      newItems.push({ number, title });
    }
    const newData = {
      title: document.getElementById('stats-title').value,
      description: document.getElementById('stats-desc').value,
      items: newItems
    };
    await updateDoc(doc(db, 'site_content', 'stats'), newData);
    alert('İstatistikler güncellendi!');
  } catch (error) {
    console.error('Güncelleme hatası (Stats):', error);
    alert('Güncelleme hatası: ' + error.message);
  }
};

window.updateCards = async function() {
  try {
    const cardsData = await getContentSection('cards');
    if (!cardsData || !cardsData.items) return;
    let newItems = [];
    for (let i = 0; i < cardsData.items.length; i++) {
      const title = document.getElementById(`card-title-${i}`).value;
      const desc = document.getElementById(`card-desc-${i}`).value;
      newItems.push({ title, description: desc });
    }
    await updateDoc(doc(db, 'site_content', 'cards'), { items: newItems });
    alert('Kartlar güncellendi!');
  } catch (error) {
    console.error('Güncelleme hatası (Cards):', error);
    alert('Güncelleme hatası: ' + error.message);
  }
};

function showLoader() {
  document.getElementById('loader').style.display = 'flex';
}
  
function hideLoader() {
  document.getElementById('loader').style.display = 'none';
}

// ------------------------------
// BLOG FUNCTIONS
// ------------------------------
window.createBlog = async function() {
  try {
    showLoader();
    const titleEl = document.getElementById('blog-title');
    const excerptEl = document.getElementById('blog-excerpt');
    const contentEl = document.getElementById('blog-content');
    const imageInput = document.getElementById('blog-image');
    let imagePath = "";
    if (imageInput && imageInput.files && imageInput.files[0]) {
      const file = imageInput.files[0];
      imagePath = await uploadBlogImage(file);
    }
    const newBlog = {
      title: titleEl.value,
      excerpt: excerptEl.value,
      content: contentEl.value,
      image: imagePath,
      createdAt: serverTimestamp()
    };
    await addDoc(collection(db, 'blogs'), newBlog);
    alert("Yeni blog eklendi!");
    loadBlogs();
  } catch (error) {
    console.error("createBlog error:", error);
    alert("Blog eklenirken hata: " + error.message);
  } finally {
    hideLoader();
  }
};

window.deleteBlog = async function(docId) {
  try {
    showLoader();
    await deleteDoc(doc(db, 'blogs', docId));
    alert("Blog silindi!");
    loadBlogs();
  } catch (error) {
    console.error("deleteBlog error:", error);
    alert("Blog silinirken hata: " + error.message);
  } finally {
    hideLoader();
  }
};

window.deleteMessage = async function(docId) {
  try {
    await deleteDoc(doc(db, 'contact_messages', docId));
    alert('Mesaj silindi!');
    loadMessages();
  } catch (error) {
    console.error('Mesaj silinirken hata:', error);
    alert('Mesaj silinirken hata: ' + error.message);
  }
};

// ------------------------------
// HAKKIMIZDA UPDATE
// ------------------------------
window.updateHakkimizdaContent = async function() {
  try {
    showLoader();
    const updatedData = {
      hero: {
        title: document.getElementById('hakkimizda-hero-title').value,
        subtitle: document.getElementById('hakkimizda-hero-subtitle').value
      },
      story: {
        heading: document.getElementById('hakkimizda-story-heading').value,
        content: document.getElementById('hakkimizda-story-content').value
      },
      team: {
        heading: document.getElementById('hakkimizda-team-heading').value,
        members: []
      }
    };
    const teamEditor = document.getElementById('team-members-editor');
    teamEditor.querySelectorAll('.team-member-editor').forEach((memberEl, i) => {
      const role = document.getElementById(`member-role-${i}`).value;
      const name = document.getElementById(`member-name-${i}`).value;
      updatedData.team.members.push({ role, name });
    });
    const docRef = doc(db, 'pages', 'hakkimizda');
    await updateDoc(docRef, updatedData);
    alert('Hakkımızda içeriği güncellendi!');
  } catch (error) {
    console.error('Hakkımızda güncelleme hatası:', error);
    alert('Güncelleme hatası: ' + error.message);
  } finally {
    hideLoader();
  }
};

window.addTeamMember = function() {
  const teamEditor = document.getElementById('team-members-editor');
  const index = teamEditor.children.length;
  const memberHTML = `
    <div class="team-member-editor">
      <label>Üye ${index + 1}</label>
      <input type="text" id="member-role-${index}" placeholder="Rol" value="">
      <input type="text" id="member-name-${index}" placeholder="İsim" value="">
      <button type="button" onclick="removeTeamMember(${index})">Sil</button>
    </div>
  `;
  teamEditor.insertAdjacentHTML('beforeend', memberHTML);
};

window.removeTeamMember = function(index) {
  const teamEditor = document.getElementById('team-members-editor');
  const memberBlock = teamEditor.querySelector(`#member-role-${index}`).closest('.team-member-editor');
  if (memberBlock) memberBlock.remove();
};

// ------------------------------
// FAQ SECTION
// ------------------------------
window.updateFAQ = async function() {
  try {
    const faqData = await getContentSection('faq');
    if (!faqData || !faqData.items) {
      alert("FAQ verisi bulunamadı. Lütfen önce oluşturun.");
      return;
    }
    let newItems = [];
    for (let i = 0; i < faqData.items.length; i++) {
      const question = document.getElementById(`faq-question-${i}`).value;
      const answer = document.getElementById(`faq-answer-${i}`).value;
      newItems.push({ question, answer });
    }
    await updateDoc(doc(db, 'site_content', 'faq'), { items: newItems });
    alert('FAQ güncellendi!');
  } catch (error) {
    console.error('Güncelleme hatası (FAQ):', error);
    alert('FAQ güncelleme hatası: ' + error.message);
  }
};

window.removeFAQItem = async function(index) {
  try {
    const faqData = await getContentSection('faq');
    if (!faqData || !faqData.items) return;
    faqData.items.splice(index, 1);
    await updateDoc(doc(db, 'site_content', 'faq'), { items: faqData.items });
    alert('SSS Silindi!');
    loadFAQEditor();
  } catch (error) {
    console.error('removeFAQItem error:', error);
    alert('SSS silinirken hata: ' + error.message);
  }
};

window.addNewFAQItem = async function() {
  try {
    const faqData = await getContentSection('faq');
    if (!faqData || !faqData.items) return;
    faqData.items.push({
      question: "Yeni soru",
      answer: "Yeni cevap"
    });
    await updateDoc(doc(db, 'site_content', 'faq'), { items: faqData.items });
    alert('Yeni SSS eklendi!');
    loadFAQEditor();
  } catch (error) {
    console.error('addNewFAQItem error:', error);
    alert('Yeni SSS eklenirken hata: ' + error.message);
  }
};

window.createDefaultFAQ = async function() {
  try {
    const defaultData = {
      items: [
        {
          question: "Hizmetleriniz neler?",
          answer: "Profesyonel oyun sunucuları, altyapı ve 7/24 destek hizmetleri sunuyoruz."
        },
        {
          question: "Destek ekibiniz var mı?",
          answer: "Evet, uzman destek ekibimiz tüm gün hizmet vermektedir."
        },
        {
          question: "Fiyatlandırma nasıl?",
          answer: "Farklı paket seçenekleri sunuyoruz. Detaylı bilgi için bizimle iletişime geçin."
        }
      ]
    };
    await setDoc(doc(db, 'site_content', 'faq'), defaultData);
    alert('Varsayılan FAQ oluşturuldu!');
    loadFAQEditor();
  } catch (error) {
    console.error('createDefaultFAQ error:', error);
    alert('Varsayılan FAQ oluşturulurken hata: ' + error.message);
  }
};



window.updateSocialLinks = async function() {
  try {
    const faqData = await getContentSection('faq');
    if (!faqData) return;
    let newLinks = [];
    if (faqData.socialLinks) {
      for (let i = 0; i < faqData.socialLinks.length; i++) {
        const label = document.getElementById(`social-label-${i}`).value;
        const url = document.getElementById(`social-url-${i}`).value;
        newLinks.push({ label, url });
      }
    }
    await updateDoc(doc(db, 'site_content', 'faq'), { socialLinks: newLinks });
    alert('Sosyal Linkler güncellendi!');
    loadFAQEditor();
  } catch (error) {
    console.error('updateSocialLinks error:', error);
    alert('Sosyal linkler güncellenirken hata: ' + error.message);
  }
};

window.addNewSocialLink = async function() {
  try {
    const faqData = await getContentSection('faq');
    if (!faqData) return;
    if (!faqData.socialLinks) faqData.socialLinks = [];
    faqData.socialLinks.push({
      label: "New Link",
      url: "https://example.com"
    });
    await updateDoc(doc(db, 'site_content', 'faq'), { socialLinks: faqData.socialLinks });
    alert('Yeni Link Eklendi!');
    loadFAQEditor();
  } catch (error) {
    console.error('addNewSocialLink error:', error);
    alert('Yeni link eklenirken hata: ' + error.message);
  }
};

window.removeSocialLink = async function(index) {
  try {
    const faqData = await getContentSection('faq');
    if (!faqData || !faqData.socialLinks) return;
    faqData.socialLinks.splice(index, 1);
    await updateDoc(doc(db, 'site_content', 'faq'), { socialLinks: faqData.socialLinks });
    alert('Link Silindi!');
    loadFAQEditor();
  } catch (error) {
    console.error('removeSocialLink error:', error);
    alert('Link silinirken hata: ' + error.message);
  }
};

// ------------------------------
// INITIALIZE SITE CONTENT
// ------------------------------


/** Helper to get document data from Firestore */
async function getContentSection(sectionName) {
  const docRef = doc(db, 'site_content', sectionName);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data();
  }
  return null;
}
