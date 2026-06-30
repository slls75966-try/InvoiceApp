const db = new PouchDB("invoiceDB");

let allInvoices = [];
let currentPage = 1;
const invoicesPerPage = 10;
/* filters */
let selectedStatus = "";
let fromDate = "";
let toDate = "";
let searchTerm = "";

document.addEventListener(
    "DOMContentLoaded",
    () => {
        loadInvoices();
        attachStatusFilter();
        attachDateFilters();
        attachSearch();
    }
);
async function loadInvoices() {

    try {

        const result =
            await db.allDocs({
                include_docs: true
            });

        const invoices =
            result.rows.filter(
                row =>
                row.doc.type === "invoice"
            );

        /*displayInvoices(invoices);*/
        allInvoices = invoices;
        displayCurrentPage();
    } catch (error) {

        console.error(error);

    }

}

function attachStatusFilter() {

  const filter = document.querySelector("#status-filter");
  filter.addEventListener("change",() => {selectedStatus = filter.value;
    currentPage = 1;
    displayCurrentPage();
   }
  );
}

function attachDateFilters() {
    document.querySelector(
        "#from-date"
    ).addEventListener(
        "change",
        applyFilters
    );

    document.querySelector(
        "#to-date"
    ).addEventListener(
        "change",
        applyFilters
    );

    document.querySelector(
        "#clear-filters-btn"
    ).addEventListener(
        "click",
        clearFilters
    );
}
function attachDateFilters1() {
    document.querySelector( "#apply-filters-btn").addEventListener( "click", applyFilters);
    document.querySelector("#clear-filters-btn").addEventListener( "click",clearFilters);
}

function applyFilters() {

    fromDate =
        document.querySelector(
            "#from-date"
        ).value;

    toDate =
        document.querySelector(
            "#to-date"
        ).value;

    currentPage = 1;

    displayCurrentPage();
}

function clearFilters() {

    selectedStatus = "";

    fromDate = "";

    toDate = "";

    document.querySelector(
        "#status-filter"
    ).value = "";

    document.querySelector(
        "#from-date"
    ).value = "";

    document.querySelector(
        "#to-date"
    ).value = "";

    currentPage = 1;

    displayCurrentPage();
}

function attachSearch() {

    document.querySelector(
        "#search-input"
    ).addEventListener(
        "input",
        applySearch
    );

}
function applySearch() {
 
 searchTerm = document.querySelector("#search-input").value.trim().toLowerCase();
 
  currentPage = 1;
  displayCurrentPage();
}

function getFilteredInvoices() {

    let filteredInvoices =
        [...allInvoices];

    /*
    ====================
        STATUS
    ====================
    */

    if (selectedStatus) {

        filteredInvoices =
            filteredInvoices.filter(
                invoice =>
                    invoice.doc.status ===
                    selectedStatus
            );
    }

    /*
    ====================
        FROM DATE
    ====================
    */

    if (fromDate) {

        filteredInvoices =
            filteredInvoices.filter(
                invoice => {

                    const invoiceDate =
                        new Date(
                            invoice.doc.invoiceDate
                        );

                    const from =
                        new Date(
                            fromDate
                        );

                    return (
                        invoiceDate >= from
                    );
                }
            );
    }

    /*
    ====================
        TO DATE
    ====================
    */

    if (toDate) {

        filteredInvoices =
            filteredInvoices.filter(
                invoice => {

                    const invoiceDate =
                        new Date(
                            invoice.doc.invoiceDate
                        );

                    const to =
                        new Date(
                            toDate
                        );

    /*====================
       END OF DAY
     ==================*/

    to.setHours( 23, 59, 59,
   999  );

     return (invoiceDate <= to);
    });
    }
    
  /*====================
        SEARCH
    ================= */

   if (searchTerm) {

        filteredInvoices =
            filteredInvoices.filter(
                invoice => {

                    const invoiceId =
                        (
                            invoice.doc.invoiceId ||
                            ""
                        ).toLowerCase();

                    const clientName =
                        (
                            invoice.doc.client.name ||
                            ""
                        ).toLowerCase();

                    return (

                        invoiceId.includes(
                            searchTerm
                        )

                        ||

                        clientName.includes(
                            searchTerm
                        )

                    );
                }
            );
    }

    return filteredInvoices;
}

function getFilteredInvoices1() {

    let filteredInvoices =
        [...allInvoices];
    /*
    ====================
        STATUS
    ====================
    */

    if (selectedStatus) {

        filteredInvoices =
            filteredInvoices.filter(
                invoice =>
                    invoice.doc.status ===
                    selectedStatus
            );
    }

    /*
    ====================
        FROM DATE
    ====================
    */
  if (fromDate) {
    filteredInvoices = filteredInvoices.filter(invoice => { const invoiceDate = invoice.doc.invoiceDate.substring( 0, 10);
    return (invoiceDate >= fromDate); });
  }

    /*
    ====================
        TO DATE
    ====================
    */

    if (toDate) {

        filteredInvoices =
            filteredInvoices.filter(
                invoice => {

                    const invoiceDate =
                        invoice.doc.invoiceDate
                            .substring(
                                0,
                                10
                            );

                    return (
                        invoiceDate <=
                        toDate
                    );
                }
            );
    }

    return filteredInvoices;
}

function displayCurrentPage() {
  const filteredInvoices = getFilteredInvoices();
  const start = (currentPage - 1) * invoicesPerPage;
  
  const end = start + invoicesPerPage;

  const pageInvoices = filteredInvoices.slice(start, end);

   displayInvoices(pageInvoices );
   renderPagination();
}
function displayCurrentPage1() {
    const start =
        (currentPage - 1) *
        invoicesPerPage;

    const end =
        start +
        invoicesPerPage;

    /*const pageInvoices =
        allInvoices.slice(
            start,
            end
        );*/
      let filteredInvoices = allInvoices;
      if (selectedStatus) {
        filteredInvoices = allInvoices.filter(invoice =>invoice.doc.status === selectedStatus);
      }
      const pageInvoices = filteredInvoices.slice(start,end);

      displayInvoices(pageInvoices );
      renderPagination();
}

function renderPagination() {
    const container =
        document.querySelector(
            "#pagination"
        );

    container.innerHTML = "";

    /*
    ====================
        FILTERED DATA
    ====================
    */

    const filteredInvoices =
        getFilteredInvoices();

    /*
    ====================
        TOTAL PAGES
    ====================
    */

    const totalPages =
        Math.ceil(
            filteredInvoices.length /
            invoicesPerPage
        );
    /*
    ====================
        NO RESULT
    ====================
    */
    if (totalPages === 0) {
        return;
    }
    /*
    ====================
        BUTTONS
    ====================
    */
    for (
        let i = 1;
        i <= totalPages;
        i++
    ) {
        const button =
            document.createElement(
                "button"
            );
        button.textContent = i;
        if (
            i === currentPage
        ) {
            button.classList.add(
                "active-page"
            );
        }

        button.addEventListener(
            "click",
            () => {

                currentPage = i;

                displayCurrentPage();
            }
        );

        container.appendChild(
            button
        );
    }
}

function renderPagination1() {

    const container =
        document.querySelector(
            "#pagination"
        );

    container.innerHTML = "";

    /*const totalPages =
        Math.ceil(
            allInvoices.length /
            invoicesPerPage
        );*/
    let filteredInvoices = allInvoices;
    if (selectedStatus) { filteredInvoices = allInvoices.filter( invoice =>invoice.doc.status === selectedStatus);
    }
    const totalPages = Math.ceil(filteredInvoices.length / invoicesPerPage );

    for (
        let i = 1;
        i <= totalPages;
        i++
    ) {

        const button =
            document.createElement(
                "button"
            );

        button.textContent = i;

        if (
            i === currentPage
        ) {

            button.classList.add(
                "active-page"
            );
        }

        button.addEventListener(
            "click",
            () => {

                currentPage = i;

                displayCurrentPage();
            }
        );

        container.appendChild(
            button
        );
    }
}
function displayInvoices(invoices) {

    const tbody =
        document.querySelector(
            "#invoice-table-body"
        );

    tbody.innerHTML = "";

    /*
    ====================
        NO INVOICES
    ====================
    */

    if (invoices.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td colspan="6"
                    class="empty-state">
              No invoices available. Click "New Invoice" to create one.
            </td>
        </tr>`;
        return;
    }

    /*
    ====================
        DISPLAY INVOICES
    ====================
    */

    invoices.forEach((invoice) => {

        const doc = invoice.doc;

        const row =
            document.createElement("tr");

        row.innerHTML = `

            <td>${doc.invoiceId}</td>

            <td>
                ${formatDate(
                    doc.invoiceDate
                )}
            </td>

            <td>
                ${doc.client.name}
            </td>

            <td>
                ${doc.status}
            </td>

            <td>
                ${doc.totals.grandTotal}
            </td>

            <td class="actions-cell">

                <button
                    class="action-btn view-btn"
                    onclick="viewInvoice('${doc._id}')"
                    title="View Invoice">
                    👁️ View
                </button>

                <button
                    class="action-btn delete-btn"
                    onclick="deleteInvoice('${doc._id}')"
                    title="Delete Invoice">
                    🗑 Delete
                </button>

                <button
                    class="action-btn edit-btn" onclick="editInvoice('${doc._id}')"
                    title="Edit Invoice">
                    ✏️ Edit
                </button>

            </td>`;

        tbody.appendChild(row);

    });

}

function formatDate(dateString) {
  const parts = dateString.split("-");
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
}
function formatDate1(dateString) {

    const date =
        new Date(dateString);

    return date.toLocaleDateString();

}

async function deleteInvoice(id) {

    try {

        const invoice = await db.get(id);

        /*
        ====================
            ONLY DRAFT
        ====================
        */

        if (invoice.status !== "draft") {

            alert(
                "Only draft invoices can be deleted."
            );

            return;
        }

        /*
        ====================
            CONFIRMATION
        ====================
        */

        const confirmed = confirm(
            `Delete invoice ${invoice.invoiceId}?`
        );

        if (!confirmed) {
            return;
        }

        await db.remove(invoice);

        alert(
            "Invoice deleted successfully."
        );

        loadInvoices();

    } catch (error) {

        console.error(
            "Delete error:",
            error
        );

        alert(
            "Failed to delete invoice."
        );

    }

}

function viewInvoice(id) {

 /* window.location.href = `viewInvoice.html?id=${id}`;*/
    window.location.href =
        `index.html?view=${id}`;
}

async function editInvoice(invoiceId) {
    try {
        const result =
            await db.allDocs({
                include_docs: true
            });

        const invoice =
            result.rows.find(
                row =>
                    row.doc.invoiceId ===
                    invoiceId
            );

        if (!invoice) {

            alert(
                "Invoice not found."
            );

            return;
        }

        if (
            invoice.doc.status !==
            "draft"
        ) {

            alert(
                "Only draft invoices can be edited."
            );

            return;
        }
        window.location.href = `index.html?edit=${invoiceId}`;
    } catch (error) {

        console.error(error);

    }

}
