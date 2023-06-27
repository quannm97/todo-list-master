window.onload = () => {
    const baseURL = "https://adventurous-dove-sundress.cyclic.app/";
    const table = {
        data: [],
        init: function () {
            this.todoList();
        },
        todoList: async function () {
            await this.pullData();
            this.setupEventListeners();
            this.renderList(this.data);
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
            const thead = document.querySelector("thead");
            const mailInput = document.querySelector("#mail");
            const desInput = document.querySelector("#des");
            const authorInput = document.querySelector("#author");
            let currentForm;
            let currentId;
            const validation = new this.Validation();

            table.addEventListener("click", ElemDetermine);
            thead.addEventListener("click", (e) => this.sort(e));

            btnNo.addEventListener("click", () => {
                deleteForm.classList.remove("active");
            });

            btnYes.addEventListener("click", () => {
                hideForm(deleteForm);
                currentId && this.deleteHandler(currentId);
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
                this.reset(false);
                const mail = mailInput.value;
                const des = desInput.value;
                const author = authorInput.value;
                const id = this.fakeId();

                if (
                    validation.check({
                        user: { mail, des, author },
                        rules: {
                            mail: ["required"],
                            des: ["required"],
                            author: ["required"],
                        },
                    })
                ) {
                    switch (currentForm) {
                        case "add":
                            this.pushData({ id, mail, des, author });
                            hideForm(editForm);
                            this.reset(true);

                            break;
                        case "edit":
                            this.editHandler({
                                id: currentId,
                                mail,
                                des,
                                author,
                            });
                            this.reset(true);

                            hideForm(editForm);

                        default:
                            break;
                    }
                } else {
                    this.invalidForm(validation, editForm);
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
            // console.log(1);
            const tableRows = document.querySelectorAll("table tbody tr");
            const crrPage = document.querySelector("#currentPage");
            const ttPages = document.querySelector("#totalPages");

            if (!tableRows) return;

            const tableRowsArray = Array.from(tableRows);

            const prevButton = document.querySelector("#prevBtn");
            const nextButton = document.querySelector("#nextBtn");

            let currentPage = 1;

            const calculateTotalPages = () => {
                const itemsPerPage = 5;
                return Math.ceil(this.data.length / itemsPerPage);
            };

            function showPage(page) {
                const itemsPerPage = 5;
                const start = (page - 1) * itemsPerPage;
                const end = start + itemsPerPage;

                tableRowsArray.forEach((row, index) => {
                    row.style.display =
                        index >= start && index < end ? "table-row" : "none";
                });
            }

            function updatePaginationText() {
                ttPages.textContent = calculateTotalPages();
                crrPage.textContent = currentPage;
            }

            function goToPrevPage() {
                if (currentPage > 1) {
                    currentPage--;
                    showPage(currentPage);
                    updatePaginationText();
                }
            }

            function goToNextPage() {
                const totalPages = calculateTotalPages();
                if (currentPage < totalPages) {
                    currentPage++;
                    showPage(currentPage);
                    updatePaginationText();
                }
            }

            prevButton.addEventListener("click", goToPrevPage);
            nextButton.addEventListener("click", goToNextPage);

            showPage(1);
            updatePaginationText();
        },

        sort: function (e) {
            console.log(e.target);

            const typeSort = e.target.closest("th").dataset.col;

            this.data.sort((a, b) => {
                // console.log(a,b);
                return a[typeSort].toLowerCase() > b[typeSort].toLowerCase()
                    ? 1
                    : -1;
            });
            this.renderList(this.data);
        },

        pullData: async function () {
            // Retrieve data from server and update table
            try {
                const response = await axios.get(baseURL + "users");
                if (response.status === 200) {
                    console.log("Data successfully pulled from the server");
                    this.updateData(response.data);
                } else {
                    console.log("Failed to pull from the server");
                }
            } catch (error) {
                console.log(error);
            }
        },
        updateData: function (newData) {
            this.data = newData;
        },
        pushData: async function ({ id, mail, des, author }) {
            // Push data to server
            try {
                const response = await axios.post(baseURL + "users", {
                    id: id,
                    mail: mail,
                    des: des,
                    author: author,
                });
                if (response.status === 201) {
                    console.log("Data successfully pushed to the server");
                    const newArr = [...this.data, { id, mail, des, author }];
                    this.updateData(newArr);
                    this.renderList(newArr);
                } else {
                    console.log("Failed to push to the server");
                }
            } catch (error) {
                console.log(error);
            }
        },
        deleteHandler: function name(id) {
            const oldArr = this.data;
            const newArr = oldArr.filter((user) => user.id !== id);
            this.updateData(newArr);
            this.deleteData(id);
            this.renderList(newArr);
        },
        deleteData: async function (id) {
            // Delete item from server based on ID
            try {
                const response = await axios.delete(baseURL + `users/${id}`);
                if (response.status === 200) {
                    console.log("Data successfully deleted to the server");
                } else {
                    console.log("Failed to delete to the server");
                }
            } catch (error) {
                console.log(error);
            }
        },
        editHandler: function (editingUser) {
            console.log(editingUser);
            const updateData = () => {
                const updatedUserIndex = this.data.findIndex((user) => {
                    return parseInt(user.id) === parseInt(editingUser.id);
                });

                const newArr = [...this.data];
                newArr[updatedUserIndex] = editingUser;
                this.updateData(newArr);
                this.renderList(newArr);
            };
            this.editData(editingUser) && updateData();
        },
        editData: async function (user) {
            // Edit item in server based on ID
            try {
                const response = await axios.put(
                    baseURL + `users/${user.id}`,

                    {
                        mail: user.mail,
                        des: user.des,
                        author: user.author,
                    }
                );
                if (response.status === 200) {
                    console.log("Data successfully edited to the server");
                    return true;
                } else {
                    console.log("Failed to edit to the server");
                }
            } catch (error) {
                console.log(error);
            }
        },
        Validation: function () {
            // Perform form validation
            // Code for form validation goes here
            let messages = {};

            const validateRules = {
                required: function (attribute, data) {
                    if (!data) {
                        return " is required";
                    }
                },
            };

            const check = (data) => {
                const _data = data;
                setMessages(_data);
                return Object.keys(messages).length === 0 ? true : false;
            };

            const getMessages = () => {
                return messages;
            };

            const setMessages = (data) => {
                messages = {};
                const { user, rules } = data;

                for (const attribute in rules) {
                    const _rules = rules[attribute];
                    for (const rule of _rules) {
                        const msg = validateRules[rule](
                            attribute,
                            user[attribute]
                        );
                        if (msg) {
                            messages[attribute] = [msg];
                        }
                    }
                }
            };
            return {
                check: check,
                setMessages: setMessages,
                getMessages: getMessages,
            };
        },
        invalidForm: function (validation, editForm) {
            const messages = validation.getMessages();

            function animate() {
                editForm.style.animation = "invalid 0.5s linear forwards";
                setTimeout(() => {
                    editForm.style.animation = null;
                    clearTimeout();
                }, 500);
            }

            function showMsg() {
                for (const input in messages) {
                    if (Object.hasOwnProperty.call(messages, input)) {
                        const errMsg = messages[input][0];
                        const element = document.querySelector("#" + input);

                        element.nextElementSibling.innerHTML =
                            element.getAttribute("placeholder") + errMsg;

                        element.classList.add("invalid");
                    }
                }
            }

            animate();
            showMsg();
        },
        fakeId: function () {
            return Math.floor(Math.random() * Date.now());
        },
        renderList: function (data) {
            const table = document.querySelector("tbody");
            table.innerHTML = "";

            const users = data;
            users.map((user, index) => {
                this.renderUser(table, user, index);
            });
            this.pagination();
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
        reset: function (isPass) {
            const inputs = document.querySelectorAll(".field input");
            const shouldClearValues = isPass;
            inputs.forEach((input) => {
                input.classList.remove("invalid");
                input.nextElementSibling.innerHTML = "";
                if (shouldClearValues) {
                    input.value = "";
                }
            });
        },
    };

    table.init();
};
