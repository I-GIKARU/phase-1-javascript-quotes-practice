document.addEventListener("DOMContentLoaded", () => {
    const quoteList = document.querySelector("#quote-list");
    const quoteForm = document.querySelector("#new-quote-form");
    const sortButton = document.createElement("button");
    let sorted = false;

    sortButton.textContent = "Sort by Author";
    document.body.insertBefore(sortButton, quoteList);
    
    function fetchQuotes() {
        fetch("http://localhost:3000/quotes")
            .then(response => response.json())
            .then(data => {
                const quotes = sorted
                    ? data.sort((a, b) => a.author.localeCompare(b.author))
                    : data;
                renderQuotes(quotes);
            });
    }
    

    function renderQuotes(quotes) {
        quoteList.innerHTML = "";
        if (sorted) {
            quotes.sort((a, b) => a.author.localeCompare(b.author));
        }
        quotes.forEach(renderQuote);
    }

    function renderQuote(quote) {
        const li = document.createElement("li");
        li.classList.add("quote-card");
        li.innerHTML = `
            <blockquote class="blockquote">
                <p class="mb-0">${quote.quote}</p>
                <footer class="blockquote-footer">${quote.author}</footer>
                <br>
                <button class='btn-success'>Likes: <span>${quote.likes ? quote.likes.length : 0}</span></button>
                <button class='btn-danger'>Delete</button>
                <button class='btn-edit'>Edit</button>
            </blockquote>
        `;
        quoteList.appendChild(li);
    }
    

    function likeQuote(quote, button) {
        fetch("http://localhost:3000/likes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ quoteId: quote.id, createdAt: Date.now() })
        })
        .then(response => response.json())
        .then(() => {
            const likeSpan = button.querySelector("span");
            likeSpan.textContent = parseInt(likeSpan.textContent) + 1;
        });
    }

    function deleteQuote(id, element) {
        fetch(`http://localhost:3000/quotes/${id}`, { method: "DELETE" })
        .then(() => element.remove());
    }

    function editQuote(quote, element) {
        const editForm = document.createElement("form");
        editForm.innerHTML = `
            <input type="text" name="quote" value="${quote.quote}">
            <input type="text" name="author" value="${quote.author}">
            <button type="submit">Save</button>
        `;
        
        element.innerHTML = "";
        element.appendChild(editForm);
        
        editForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const updatedQuote = editForm.quote.value;
            const updatedAuthor = editForm.author.value;
            
            fetch(`http://localhost:3000/quotes/${quote.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ quote: updatedQuote, author: updatedAuthor })
            })
            .then(response => response.json())
            .then(updatedData => renderQuote(updatedData));
        });
    }

    quoteForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const newQuote = {
            quote: e.target.quote.value,
            author: e.target.author.value,
            likes: []
        };

        fetch("http://localhost:3000/quotes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newQuote)
        })
        .then(response => response.json())
        .then(renderQuote);
        
        e.target.reset();
    });

    sortButton.addEventListener("click", () => {
        sorted = !sorted;
        fetchQuotes();
    });

    fetchQuotes();
});