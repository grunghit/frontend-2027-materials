// api.js — searches the Open Library catalogue
export async function searchBooks(query) {
  const res = await fetch(`https://openlibrary.org/search.json?q=${query}&limit=8`);
  const data = await res.json();
  return (data.docs || []).map((doc) => ({ title: doc.title, year: doc.first_publish_year }));
}
