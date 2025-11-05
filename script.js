/* NAVIGASI */
function navigate(id) {
    document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}
function kembali(to){ navigate(to); }

/* DATA FILM, HARGA, DISKON, SINOPSIS */
const sinopsis = {
  inside: "Riley yang telah beranjak remaja. Ia mengalami masa pubertas dan menghadapi empat emosi baru yang kompleks: Cemas (Anxiety), Iri (Envy), Bosan (Ennui), dan Malu (Embarrassment), yang menyebabkan kekacauan di pusat kendali emosinya.Emosi-emosi lama berusaha beradaptasi dengan munculnya emosi baru yang lebih rumit ini, terutama ketika Riley berjuang menyesuaikan diri dengan kehidupan SMA dan tim hoki barunya.",
  komang: "Raim, pemuda dari Buton, jatuh hati pada Komang Ade, seorang gadis Bali. Keduanya begitu bahagia, jalinan cinta mereka berjalan mulus. Namun seiring waktu, mereka harus menghadapi kenyataan dan tantangan besar - yaitu perbedaan keyakinan.",
  pengabdi: "kelanjutan kisah keluarga Suwono—Rini, Bapak, Toni, dan Bondi—yang pindah ke rumah susun untuk memulai hidup baru setelah teror mengerikan di rumah lama mereka. Namun, mereka segera menyadari bahwa tinggal di rumah susun pun penuh bahaya karena teror dari sosok Ibu kembali menghantui, bahkan lebih kuat dari sebelumnya. Keluarga tersebut harus bertahan dari serangkaian kejadian mengerikan yang lebih intens di tengah lingkungan baru mereka. ",
  minecraft: "empat orang yang tidak cocok satu sama lain—Garrett, Henry, Natalie, dan Dawn—terjebak di dunia kubus bernama Overworld setelah melewati portal misterius. Untuk kembali ke dunia asal, mereka harus menguasai dunia baru ini dan bekerja sama, dibantu oleh ahli pembangun bernama Steve, sambil menghadapi berbagai tantangan dan makhluk berbahaya seperti Piglins dan Zombies. "
};
const hargaFilm = { inside:55000, komang:50000, pengabdi:60000, minecraft:55000 };
const diskonFilm = { inside:0.05, komang:0.10, pengabdi:0.10, minecraft:0.15 };

/* STORAGE */
let kursiTerisi = JSON.parse(localStorage.getItem('kursiData')) || { inside:[], komang:[], pengabdi:[], minecraft:[] };
let pelanggan = JSON.parse(localStorage.getItem('pelanggan')) || [];

/* STATE */
let filmDipilih = '';
let waktuPilih = '';
let seatsSelected = [];
let totalBayar = 0;

/* JENIS UANG */
function rupiah(n){ return 'Rp ' + n.toLocaleString('id-ID'); }

/* PILIH FILM */
function pilihFilm(key){
  filmDipilih = key;
  // judul
  const jud = { inside:'INSIDE OUT 2', komang:'KOMANG', pengabdi:'PENGABDI SETAN 2', minecraft:'MINECRAFT MOVIE' };
  document.getElementById('judulFilm').innerText = jud[key];
  // poster ambil src dari card
  const cardImg = document.querySelector(`[onclick="pilihFilm('${key}')"] img`);
  if(cardImg) document.getElementById('posterFilm').src = cardImg.src;
  // sinopsis & harga 
  document.getElementById('sinopsisText').innerText = sinopsis[key];
  document.getElementById('hargaFilm').innerText = `Harga: ${rupiah(hargaFilm[key])}`;
  // reset waktu & kursiSelected
  waktuPilih = '';
  seatsSelected = [];
  navigate('halamanDetail');
}

/* PILIH WAKTU */
function pilihWaktu(btn, time){
  document.querySelectorAll('.btn-waktu').forEach(x=>x.classList.remove('pilih'));
  btn.classList.add('pilih');
  waktuPilih = time;
}

/* BUKA HALAMAN KURSI */
function kePilihKursi(){
  if(!filmDipilih) return alert('Pilih film terlebih dahulu.');
  buatKursi();
  navigate('halamanKursi');
}

/* GENERATE KURSI */
function buatKursi(){
  seatsSelected = []; 
  const container = document.getElementById('kursiContainer');
  container.innerHTML = '';
  const allSeats = ['A1','A2','A3','A4','A5','B1','B2','B3','B4','B5','C1','C2','C3','C4','C5'];

  allSeats.forEach(code=>{
    const isBooked = kursiTerisi[filmDipilih].includes(code);
    const div = document.createElement('div');
    div.className = 'kursi ' + (isBooked ? 'merah' : 'hijau');
    div.innerText = code;

    if(isBooked){
      div.onclick = ()=> alert('Kursi ini sudah terisi!');
    } else {
      div.onclick = ()=>{
        // jumlah tiket yang diinginkan
        const jumlah = Math.max(1, parseInt(document.getElementById('jumlahTiket').value) || 1);

        if(seatsSelected.includes(code)){
          // deselect
          seatsSelected = seatsSelected.filter(s=>s!==code);
          div.classList.remove('pilih');
        } else {
          if(seatsSelected.length >= jumlah){
            alert(`Kamu sudah mencapai batas pilihan kursi, dengan memilih ${jumlah} kursi.`);
            return;
          }
          seatsSelected.push(code);
          div.classList.add('pilih');
        }
      };
    }

    container.appendChild(div);
  });
}

/* LANJUT PEMBAYARAN  */
function lanjutPembayaran(){
  const jumlah = Math.max(1, parseInt(document.getElementById('jumlahTiket').value) || 1);

  if(!waktuPilih) return alert('Pilih waktu terlebih dahulu.');
  if(seatsSelected.length !== jumlah) return alert(`Pilih ${jumlah} kursi. Sekarang kamu memilih ${seatsSelected.length}.`);

  // hitung total dengan diskon
  const harga = hargaFilm[filmDipilih];
  const disk = diskonFilm[filmDipilih] || 0;
  totalBayar = Math.round((harga * (1 - disk)) * jumlah);

  document.getElementById('totalHarga').innerText = rupiah(totalBayar);
  document.getElementById('kembalianInput').value = '';
  document.getElementById('bayarInput').value = '';

  navigate('halamanPembayaran');
}

/* ENTER pada input bayar -> hitung kembalian */
function tekanEnter(e){
  if(e.key !== 'Enter') return;
  const bayar = parseInt(document.getElementById('bayarInput').value) || 0;
  const kembali = bayar - totalBayar;
  document.getElementById('kembalianInput').value = (kembali < 0) ? 'Uang kurang!' : rupiah(kembali);
}

/* SIMPAN DATA (multi-seat) */
function simpanData(){
  const nama = (document.getElementById('namaPelanggan').value || '').trim();
  if(!nama) return alert('Nama harus diisi!');
  if(!filmDipilih) return alert('Film tidak terpilih (error).');
  if(!waktuPilih) return alert('Waktu tidak terpilih (error).');
  if(seatsSelected.length === 0) return alert('Pilih kursi dulu.');

  // simpan kursi sebagai terisi
  kursiTerisi[filmDipilih] = kursiTerisi[filmDipilih].concat(seatsSelected);
  localStorage.setItem('kursiData', JSON.stringify(kursiTerisi));

  // simpan setiap pembelian sebagai satu record dengan array seats dan jumlah tiket
  pelanggan.push({
    nama,
    film: filmDipilih,
    waktu: waktuPilih,
    kursi: [...seatsSelected],
    jumlahTiket: seatsSelected.length,  // Tambahan field jumlah tiket
    total: totalBayar,
    diskon: Math.round((diskonFilm[filmDipilih] || 0) * 100)
  });
  localStorage.setItem('pelanggan', JSON.stringify(pelanggan));

  // bersihkan state & tampilkan data pada halaman utama
  seatsSelected = [];
  waktuPilih = '';
  filmDipilih = '';
  document.getElementById('namaPelanggan').value = '';
  document.getElementById('jumlahTiket').value = 1;

  renderDataContainer();
  navigate('halamanUtama');
}

/* RENDER DATA PELANGGAN di halaman utama */
   const namaFilmLengkap = {
     "inside": "INSIDE OUT 2",
     "pengabdi": "PENGABDI SETAN 2",
     "komang": "KOMANG",
     "minecraft": "MINECRAFT MOVIE"
   };
   
function renderDataContainer() {
  const container = document.getElementById('dataContainer');
  const pelanggan = JSON.parse(localStorage.getItem('pelanggan')) || [];
  container.innerHTML = '';

  if (pelanggan.length === 0) {
    container.innerHTML = '<div class="data-card">Belum ada pembeli.</div>';
    return;
  }

  pelanggan.forEach((p) => {
    const hargaAkhir = p.total * (1 - (p.diskon || 0) / 100);

    const card = document.createElement('div');
    card.className = 'data-card';
    card.style.padding = '12px 16px';
    card.style.border = '4px solid #070707ff';
    card.style.borderRadius = '6px';
    card.style.marginBottom = '12px';
    card.style.background = '#ddef53ff';
    card.style.fontFamily = 'Arial, sans-serif';
    card.style.fontSize = '14px';
    card.style.color = '#080808ff';

    card.innerHTML = `
      <h2 style="margin-top: 0; margin-bottom: 12px; font-weight: bold; font-size: 20px; color: #222;">
        Data Pelanggan
      </h2>
      <table style="border-collapse: collapse; width: 100%; max-width: 400px;">
        <tbody>
          <tr>
            <td style="width: 130px; font-weight: bold;">Nama Pelanggan</td>
            <td style="text-align: center; width: 15px;">:</td>
            <td style="text-align: left;">${p.nama}</td>
          </tr>
          <tr>
            <td style="font-weight: bold;">Nama Film</td>
            <td style="text-align: center;">:</td>
            <td style="text-align: left;">
              ${namaFilmLengkap[p.film.toLowerCase()] || p.film}
            </td>
          </tr>
          <tr>
            <td style="font-weight: bold;">Waktu</td>
            <td style="text-align: center;">:</td>
            <td style="text-align: left;">${p.waktu}</td>
          </tr>
          <tr>
            <td style="font-weight: bold;">Jumlah Tiket</td>
            <td style="text-align: center;">:</td>
            <td style="text-align: left;">${p.jumlahTiket}</td>
          </tr>
          <tr>
            <td style="font-weight: bold;">Kursi</td>
            <td style="text-align: center;">:</td>
            <td style="text-align: left;">${p.kursi.join(', ')}</td>
          </tr>
          <tr>
            <td style="font-weight: bold;">Harga Film</td>
            <td style="text-align: center;">:</td>
            <td style="text-align: left;">${rupiah(p.total)}</td>
          </tr>
          <tr>
            <td style="font-weight: bold;">Diskon</td>
            <td style="text-align: center;">:</td>
            <td style="text-align: left;">${p.diskon}%</td>
          </tr>
          <tr>
            <td style="font-weight: bold;">Harga Akhir</td>
            <td style="text-align: center;">:</td>
            <td style="text-align: left;">${rupiah(hargaAkhir)}</td>
          </tr>
        </tbody>
      </table>
    `;
    container.appendChild(card);
  });
}

/* RESET semua data (confirm) */
function resetAll(){
  if(!confirm('Reset semua data pelanggan dan kursi terisi?')) return;
  localStorage.removeItem('pelanggan');
  localStorage.removeItem('kursiData');
  pelanggan = [];
  kursiTerisi = { inside:[], komang:[], pengabdi:[], minecraft:[] };
  seatsSelected = [];
  filmDipilih = '';
  waktuPilih = '';
  totalBayar = 0;
  renderDataContainer();
  alert('Semua data telah direset.');
  navigate('halamanUtama');
}

/* Inisialisasi saat pertama load */
(function init(){
  pelanggan = JSON.parse(localStorage.getItem('pelanggan')) || [];
  kursiTerisi = JSON.parse(localStorage.getItem('kursiData')) || { inside:[], komang:[], pengabdi:[], minecraft:[] };
  renderDataContainer();
})();

/* CARI DATA PELANGGAN */

function tampilData() {
    navigate('halamanCari');
    document.getElementById('hasilCari').innerHTML = '';
    document.getElementById('inputCariNama').value = '';
}

function cariNamaPelanggan() {
    const nama = (document.getElementById('inputCariNama').value || '').trim().toLowerCase();
    const hasilEl = document.getElementById('hasilCari');
    hasilEl.innerHTML = '';

    const data = JSON.parse(localStorage.getItem('pelanggan')) || [];

    if (!nama) {
        hasilEl.innerHTML = '<div class="data-card">Masukkan nama dulu!</div>';
        return;
    }

    const cocok = data.filter(p => (p.nama || '').toLowerCase().includes(nama));

    if (cocok.length === 0) {
        hasilEl.innerHTML = '<div class="data-card">Data tidak ditemukan.</div>';
        return;
    }

    cocok.forEach(p => {
        const hargaAkhir = p.total * (1 - (p.diskon || 0) / 100);

        const card = document.createElement('div');
        card.className = 'data-card';

        card.innerHTML = `
            <h2 style="margin-top:0; margin-bottom:12px; font-weight:bold; font-size:20px; color: #222;">
            Data Pelanggan</h2>
            <table style="border-collapse: collapse; width:100%; max-width:400px;">
            <tbody>

            <tr>
                <td style="width:130px; font-weight:bold;">Nama Pelanggan</td>
                <td style="text-align:center;">:</td>
                <td>${p.nama}</td>
            </tr>

            <tr>
                <td style="font-weight:bold;">Nama Film</td>
                <td style="text-align:center;">:</td>
                <td>${namaFilmLengkap[p.film.toLowerCase()]}</td>
            </tr>

            <tr>
                <td style="font-weight:bold;">Waktu</td>
                <td style="text-align:center;">:</td>
                <td>${p.waktu}</td>
            </tr>

            <tr>
                <td style="font-weight:bold;">Jumlah Tiket</td>
                <td style="text-align:center;">:</td>
                <td>${p.jumlahTiket}</td>
            </tr>

            <tr>
                <td style="font-weight:bold;">Kursi</td>
                <td style="text-align:center;">:</td>
                <td>${p.kursi.join(', ')}</td>
            </tr>

            <tr>
                <td style="font-weight:bold;">Harga Film</td>
                <td style="text-align:center;">:</td>
                <td>${rupiah(p.total)}</td>
            </tr>

            <tr>
                <td style="font-weight:bold;">Diskon</td>
                <td style="text-align:center;">:</td>
                <td>${p.diskon}%</td>
            </tr>

            <tr>
                <td style="font-weight:bold;">Harga Akhir</td>
                <td style="text-align:center;">:</td>
                <td>${rupiah(hargaAkhir)}</td>
            </tr>

            </tbody>
            </table>
        `;

        hasilEl.appendChild(card); 
    });
}

function urutkanPelanggan() {
    const hasilEl = document.getElementById('hasilCari');
    hasilEl.innerHTML = '';

    let data = JSON.parse(localStorage.getItem('pelanggan')) || [];
    data.sort((a, b) => (a.nama || '').localeCompare(b.nama || ''));

    if (data.length === 0) {
        hasilEl.innerHTML = '<div class="data-card">Belum ada data pelanggan.</div>';
        return;
    }

    data.forEach(p => {
        const hargaAkhir = p.total * (1 - (p.diskon || 0) / 100);

        const card = document.createElement('div');
        card.className = 'data-card';

        card.innerHTML = `
            <h2 style="margin-top:0; margin-bottom:12px; font-weight:bold; font-size:20px; color: #222;">
            Data Pelanggan</h2>
            <table style="border-collapse: collapse; width:100%; max-width:400px;">
            <tbody>

            <tr>
                <td style="width:130px; font-weight:bold;">Nama Pelanggan</td>
                <td style="text-align:center;">:</td>
                <td>${p.nama}</td>
            </tr>

            <tr>
                <td style="font-weight:bold;">Nama Film</td>
                <td style="text-align:center;">:</td>
                <td>${namaFilmLengkap[p.film.toLowerCase()]}</td>
            </tr>

            <tr>
                <td style="font-weight:bold;">Waktu</td>
                <td style="text-align:center;">:</td>
                <td>${p.waktu}</td>
            </tr>

            <tr>
                <td style="font-weight:bold;">Jumlah Tiket</td>
                <td style="text-align:center;">:</td>
                <td>${p.jumlahTiket}</td>
            </tr>

            <tr>
                <td style="font-weight:bold;">Kursi</td>
                <td style="text-align:center;">:</td>
                <td>${p.kursi.join(', ')}</td>
            </tr>

            <tr>
                <td style="font-weight:bold;">Harga Film</td>
                <td style="text-align:center;">:</td>
                <td>${rupiah(p.total)}</td>
            </tr>

            <tr>
                <td style="font-weight:bold;">Diskon</td>
                <td style="text-align:center;">:</td>
                <td>${p.diskon}%</td>
            </tr>

            <tr>
                <td style="font-weight:bold;">Harga Akhir</td>
                <td style="text-align:center;">:</td>
                <td>${rupiah(hargaAkhir)}</td>
            </tr>

            </tbody>
            </table>
        `;

        hasilEl.appendChild(card); 
    });
}
