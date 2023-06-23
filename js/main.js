window.onload = () => {
    const table = {
        init: function () {
            this.todoList();
        },
        todoList: async function () {
            await this.renderList();
            this.setupEventListeners();
            this.pagination();
        },
        setupEventListeners: function () {
            const btnAdd = document.querySelector(".btnAdd");
            const btnCancel = document.querySelector("#cancel");
            const btnComplete = document.querySelector("#complete");
            const btnNo = document.querySelector("#no");
            const btnYes = document.querySelector("#yes");
            const deleteForm = document.querySelector(".form-delete");
            const editForm = document.querySelector(".form-add-edit");
            const table = document.querySelector("table");
            const mailInput = document.querySelector("#mail");
            const desInput = document.querySelector("#des");
            const authorInput = document.querySelector("#author");
            let currentForm;
            let currentId;

            table.addEventListener("click", ElemDetermine);

            btnNo.addEventListener("click", () => {
                deleteForm.classList.remove("active");
            });

            btnYes.addEventListener("click", () => {
                currentId && this.deleteHandler(currentId);
                hideForm(deleteForm);
            });

            btnCancel.addEventListener("click", () => {
                hideForm(editForm);
            });

            btnAdd.addEventListener("click", () => {
                currentForm = "add";
                showForm(editForm);
            });

            btnComplete.addEventListener("click", (event) => {
                event.preventDefault();

                const mail = mailInput.value;
                const des = desInput.value;
                const author = authorInput.value;
                const id = this.fakeId();
                switch (currentForm) {
                    case "add":
                        this.pushData({ id, mail, des, author });
                        hideForm(editForm);
                        break;
                    case "edit":
                        this.editHandler({ currentId, mail, des, author });
                        hideForm(editForm);

                    default:
                        break;
                }
            });

            function showForm(form) {
                form.classList.add("active");
            }

            function hideForm(form) {
                form.classList.remove("active");
            }

            function ElemDetermine(e) {
                const user = e.target.closest("tr");
                const userId = parseInt(user.id);
                currentId = userId;

                if (e.target.closest(".edit")) {
                    currentForm = "edit";
                    showForm(editForm);
                }
                if (e.target.closest(".trash")) {
                    showForm(deleteForm);
                }
            }
        },
        pagination: function () {
            const tableRows = document.querySelectorAll("table tbody tr");
            console.log(tableRows);
            if (tableRows) {
                const tableRowsArray = Array.from(tableRows);
                const prevButton = document.querySelector("#prevBtn");
                const nextButton = document.querySelector("#nextBtn");

                function showPage(page) {
                    const itemsPerPage = 5;
                    const start = (page - 1) * itemsPerPage;
                    const end = start + itemsPerPage;

                    tableRowsArray.forEach((row, index) => {
                        if (index >= start && index < end) {
                            row.style.display = "table-row";
                        } else {
                            row.style.display = "none";
                        }
                    });
                }

                let currentPage = 1;
                const totalPages = Math.ceil(tableRowsArray.length / 5);

                showPage(currentPage);

                prevButton.addEventListener("click", () => {
                    if (currentPage > 1) {
                        currentPage--;
                        showPage(currentPage);
                    }
                });

                nextButton.addEventListener("click", () => {
                    if (currentPage < totalPages) {
                        currentPage++;
                        showPage(currentPage);
                    }
                });
            }
        },
        pullData: async function () {
            // Retrieve data from server and update table
            try {
                const response = await axios.get("http://localhost:3000/users");
                if (response.status === 200) {
                    console.log("Data successfully pulled from the server");
                    return response;
                } else {
                    console.log("Failed to pull from the server");
                }
            } catch (error) {
                console.log(error);
            }
        },
        pushData: async function ({ id, mail, des, author }) {
            // Push data to server
            try {
                const response = await axios.post(
                    "http://localhost:3000/users",
                    {
                        id: id,
                        mail: mail,
                        des: des,
                        author: author,
                    }
                );
                if (response.status === 201) {
                    console.log("Data successfully pushed to the server");
                    this.renderList();
                } else {
                    console.log("Failed to push to the server");
                }
            } catch (error) {
                console.log(error);
            }
        },
        deleteHandler: async function (id) {
            // Delete item from server based on ID
            try {
                const response = await axios.delete(
                    `http://localhost:3000/users/${id}`
                );
                if (response.status === 200) {
                    console.log("Data successfully deleted to the server");
                    this.renderList();
                } else {
                    console.log("Failed to delete to the server");
                }
            } catch (error) {
                console.log(error);
            }
        },
        editHandler: async function (user) {
            // Edit item in server based on ID
            console.log(user);
            try {
                const response = await axios.put(
                    `http://localhost:3000/users/${user.currentId}`,

                    {
                        mail: user.mail,
                        des: user.des,
                        author: user.author,
                    }
                );
                if (response.status === 200) {
                    console.log("Data successfully edited to the server");
                    this.renderList();
                } else {
                    console.log("Failed to edit to the server");
                }
            } catch (error) {
                console.log(error);
            }
        },
        validation: function (callback) {
            // Perform form validation
            // Code for form validation goes here
        },
        fakeId: function () {
            return Math.floor(Math.random() * Date.now());
        },
        renderList: async function () {
            const table = document.querySelector("tbody");
            table.innerHTML = "";

            const response = await this.pullData();
            const users = response.data;
            users.map((user, index) => {
                this.renderUser(table, user, index);
            });
        },
        renderUser: function (position, user, index) {
            position.insertAdjacentHTML(
                "beforeend",
                `<tr id=${user.id}>
                    <td class="id">${index + 1}</td>
                    <td class="title">${user.mail}</td>
                    <td class="des">${user.des}</td>
                    <td class="author">${user.author}</td>
                    <td class="edit">
                    <i class="fas fa-edit" aria-hidden="true"></i>
                    </td>
                    <td class="trash">
                    <i class="fas fa-trash-alt" aria-hidden="true"></i>
                    </td>
                </tr>`
            );
        },
    };

    table.init();
};
