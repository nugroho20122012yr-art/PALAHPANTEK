exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method Not Allowed" };
  
  try {
    const { message } = JSON.parse(event.body);
    if (!message) return { statusCode: 400, body: "No message" };

    const lower = message.toLowerCase();
    let response = "";

    if (lower.includes('cara') || lower.includes('pakai') || lower.includes('how') || lower.includes('tutor')) {
      response = "Cara pakainya gampang! 1. Klik area Upload atau seret foto ke dalam kotak. 2. Klik tombol 'Generate Crayon'. 3. Tunggu sebentar dan simpan hasilnya!";
    } else if (lower.includes('warna') || lower.includes('color')) {
      response = "Web ini menggunakan 20 palet warna krayon premium yang menyesuaikan dengan gambar asli Anda secara otomatis.";
    } else if (lower.includes('halo') || lower.includes('hi') || lower.includes('p')) {
      response = "Halo! Saya adalah CID•AI Assistant. Ada yang bisa saya bantu terkait cara penggunaan web ini?";
    } else if (lower.includes('siapa') || lower.includes('pembuat') || lower.includes('developer')) {
      response = "Saya adalah asisten pintar dari CID•AI, dikembangkan khusus untuk konversi gambar bergaya krayon.";
    } else {
      response = "Maaf, ingatan saya terbatas hanya pada cara penggunaan web CID•AI ini. Silahkan coba tanya 'Bagaimana cara pakainya?' atau 'Warna apa saja yang tersedia?'.";
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ response }),
    };
  } catch (err) {
    return { statusCode: 500, body: "Internal Server Error" };
  }
};
