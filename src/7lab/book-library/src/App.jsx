import React, {useState, useEffect} from "react";
import BookCard from './BookCard';
import './App.css'

const App = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBookCover = async(isbn) => {
    try{
      const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`);
      const data = await response.json();

      if(data.items && data.items.length > 0){
        const imageURL = data.items[0].volumeInfo.imageLinks?.thumbnail;

        if(imageURL){
          const imageResponse = await fetch(imageURL);
          const blob = await imageResponse.blob();
          return blob;
        }
      }
      return null;
    }
    catch(err){
      console.error("Не удалось получить обложку:", err);
      return null;
    }
  };

  useEffect(() => {
    const loadBooks = async () => {
      try{
        setLoading(true);
        setError(null);

        const response = await fetch('https://fakeapi.extendsclass.com/books');
        const booksData = await response.json();

        const booksWithCovers = await Promise.all(
          booksData.map(async (book) => {
            const coverBlob = await fetchBookCover(book.isbn);
            return {
              ...book,
              coverBlob
            };
          })
        );

        setBooks(booksWithCovers);
      }
      catch(err){
        setError('Ошибка загрузки книг: ' + err.message);
      }
      finally{
        setLoading(false);
      }
    };

    loadBooks();
  }, [])
}
