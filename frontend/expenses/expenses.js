document.addEventListener("DOMContentLoaded", async function () {
  const apiUrl = "http://localhost:5000/expenses";
  const leaderboardUrl = "http://localhost:5000/premium/showleaderboard";

  const showDownloadsUrl = "http://localhost:5000/premium/showdownloads";
  const expenseList = document.getElementById("expenseList");
  const leaderboardList = document.getElementById("leaderboard");
  const downloadedfilesList = document.getElementById("downloadedfiles");

  const messageDiv = document.getElementById("message");
  const buyPremiumButton = document.getElementById("buyPremium");
  const showLeaderboardButton = document.getElementById("showLeaderboard");
  const downloadExpensesButton = document.getElementById("downloadExpenses");
  const showDownloadsButton = document.getElementById("showDownloads");

  // const expenseForm = document.getElementById("expenseForm");
  // const dynamicPaginationList = document.getElementById("itemsPerPage");

  const itemsPerPageSelect = document.getElementById("itemsPerPage");
  const expensesContainer = document.getElementById("expenses");
  const paginationContainer = document.getElementById("pagination");

  const token = localStorage.getItem("token");

  let currentPage = 1;

  function saveItemsPerPageToLocalStorage(limit) {
    localStorage.setItem("limit", limit);
  }

  function getItemsPerPageFromLocalStorage() {
    return localStorage.getItem("limit") || "1";
  }

  itemsPerPageSelect.addEventListener("change", function (event) {
    const newLimit = event.target.value;
    saveItemsPerPageToLocalStorage(newLimit);
    currentPage = 1; 
    fetchExpenses(currentPage);
  });

  itemsPerPageSelect.value = getItemsPerPageFromLocalStorage(); 
  fetchExpenses(currentPage);

  async function fetchExpenses(page = 1) {
    try {
      const itemsPerPage = localStorage.getItem("limit") || "1";
      console.log(itemsPerPage);
      const response = await fetch(
        `${apiUrl}?page=${page}&limit=${itemsPerPage}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch expenses");
      }

      const data = await response.json();
      const { res, premium, totalItems } = data;
      console.log(data);

      if (!Array.isArray(res)) {
        throw new Error("Unexpected response format");
      }

      expenseList.innerHTML = "";

      res.forEach((expense) => {
        const li = document.createElement("li");
        li.textContent = `${expense.amount} - ${expense.description} - ${expense.category}`;

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.className = "delete-btn";
        deleteButton.onclick = async function () {
          await deleteExpense(expense.id);
        };
        li.appendChild(deleteButton);

        expenseList.appendChild(li);
      });

      if (premium) {
        buyPremiumButton.style.display = "none";
        showLeaderboardButton.style.display = "block";
        downloadExpensesButton.style.display = "block";
        showDownloadsButton.style.display = "block";
        messageDiv.textContent = "You are a premium user";
        messageDiv.className = "message success";
      } else {
        buyPremiumButton.style.display = "block";
        showLeaderboardButton.style.display = "none";
        downloadExpensesButton.style.display = "none";
        showDownloadsButton.style.display = "none";
      }
      renderPagination(totalItems, itemsPerPage);
    } catch (error) {
      console.error("Error fetching expenses:", error);
      messageDiv.textContent = "Error fetching expenses";
      messageDiv.className = "message error";
    }
  }

  function renderPagination(totalItems, itemsPerPage) {
    paginationControls.innerHTML = "";

    const totalPages = Math.ceil(totalItems / itemsPerPage);
    let startPage = Math.max(1, currentPage - 1);
    let endPage = Math.min(totalPages, startPage + 2);

    if (endPage - startPage < 3) {
      startPage = Math.max(1, endPage - 3);
    }

    if (currentPage > 1) {
      const prevButton = document.createElement("button");
      prevButton.textContent = "Prev";
      prevButton.addEventListener("click", () => {
        currentPage--;
        fetchExpenses(currentPage);
      });
      paginationControls.appendChild(prevButton);
    }

    for (let i = startPage; i <= endPage; i++) {
      const pageButton = document.createElement("button");
      pageButton.textContent = i;
      pageButton.className = i === currentPage ? "active" : "";
      pageButton.addEventListener("click", () => {
        currentPage = i;
        fetchExpenses(currentPage);
      });
      paginationControls.appendChild(pageButton);
    }

    if (currentPage < totalPages) {
      const nextButton = document.createElement("button");
      nextButton.textContent = "Next";
      nextButton.addEventListener("click", () => {
        currentPage++;
        fetchExpenses(currentPage);
      });
      paginationControls.appendChild(nextButton);
    }
  }

  async function deleteExpense(id) {
    try {
      const response = await fetch(`${apiUrl}/deleteexpense/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: token,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete expense");
      }

      fetchExpenses(currentPage);
      messageDiv.textContent = "Expense deleted successfully";
      messageDiv.className = "message success";
    } catch (error) {
      console.error("Error deleting expense:", error);
      messageDiv.textContent = "Error deleting expense";
      messageDiv.className = "message error";
    }
  }
  showLeaderboardButton.addEventListener("click", async function () {
    try {
      const response = await fetch(leaderboardUrl, {
        headers: {
          Authorization: token,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch leaderboard");
      }

      const leaderboard = await response.json();
      leaderboardList.innerHTML = "";
      leaderboard.forEach((user) => {
        const li = document.createElement("li");
        li.textContent = `${user.name} - Total Expense: ${user.totalExpense}`;
        leaderboardList.appendChild(li);
      });
      leaderboardList.style.display = "block";
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      messageDiv.textContent = "Error fetching leaderboard";
      messageDiv.className = "message error";
    }
  });

  showDownloadsButton.addEventListener("click", async function () {
    try {
      const response = await fetch(showDownloadsUrl, {
        headers: {
          Authorization: token,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch downloads");
      }

      const downloadsFiles = await response.json();
      console.log(downloadsFiles); 

      if (Array.isArray(downloadsFiles.files)) {
        downloadedfilesList.innerHTML = "";

        downloadsFiles.files.forEach((file) => {
          const li = document.createElement("li");

          const link = document.createElement("a");
          link.href = file.fileUrl;
          link.textContent = `Download ${file.fileUrl.split("/").pop()}`;
          link.target = "_blank";

          const dateSpan = document.createElement("span");
          dateSpan.textContent = ` - Downloaded on: ${new Date(
            file.downloadDate
          ).toLocaleString()}`;
          dateSpan.style.marginLeft = "10px";

          li.appendChild(link);
          li.appendChild(dateSpan);
          downloadedfilesList.appendChild(li);
        });

        downloadedfilesList.style.display = "block";
      } else {
        throw new Error("Unexpected response format");
      }
    } catch (error) {
      console.error("Error fetching files:", error);
      messageDiv.textContent = "Error fetching files";
      messageDiv.className = "message error";
    }
  });
  buyPremiumButton.addEventListener("click", async function () {
    try {
      const response = await fetch(
        "http://localhost:5000/purchase/premiummembership",
        {
          method: "POST",
          headers: {
            Authorization: token,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to initiate premium purchase");
      }

      const { razorpayOrderId, razorpayKey, name, email } =
        await response.json();

      const options = {
        key: razorpayKey,
        order_id: razorpayOrderId,
        name: "Expense Tracker",
        description: "Premium Membership",
        handler: async function (response) {
          await fetch(
            "http://localhost:5000/purchase/updatetransactionstatus",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: token,
              },
              body: JSON.stringify({
                order_id: options.order_id,
                payment_id: response.razorpay_payment_id,
              }),
            }
          );

          fetchExpenses();
        },
      };

      const rzp1 = new Razorpay(options);
      rzp1.open();
    } catch (error) {
      console.error("Error purchasing premium:", error);
      messageDiv.textContent = "Error purchasing premium";
      messageDiv.className = "message error";
    }
  });

  expenseForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const amount = document.getElementById("amount").value;
    const description = document.getElementById("description").value;
    const category = document.getElementById("category").value;

    try {
      const response = await fetch(`${apiUrl}/addexpense`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify({
          amount,
          description,
          category,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add expense");
      }

      expenseForm.reset();
      fetchExpenses();
      messageDiv.textContent = "Expense added successfully";
      messageDiv.className = "message success";
    } catch (error) {
      console.error("Error adding expense:", error);
      messageDiv.textContent = "Error adding expense";
      messageDiv.className = "message error";
    }
  });

  downloadExpensesButton.addEventListener("click", function () {
    window.location.href = "../expensereport.html";
  });

  fetchExpenses(currentPage);
});
