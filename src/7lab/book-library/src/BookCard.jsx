import React from "react";

const BookCard = ({title, authors, coverBlob}) => {
    const coverURL = coverBlob ? URL.createObjectURL(coverBlob) : null;

    return (
        <div className="book-card">
            <div className="book-cover">
                {coverURL ? 
                    (<img src={coverURL} alt={title}/>) 
                    :
                    (<div className="no-cover">No-cover</div>)
                }
            </div>
            <h2 className="book-title">{title}</h2>
            <p className="book-authors">{authors.join(', ')}</p>
        </div>
    )
}

export default BookCard;