/*========================
 invoice.js
=======================*/

/*=========================
    DATABASE
========================*/

const db = new PouchDB("invoiceDB");
let currentTaxRate = 10;

/*document.addEventListener("DOMContentLoaded", () => {
       initializeInvoice();
});*/

document.addEventListener(
    "DOMContentLoaded",
    async () => {
        await initializeInvoice();
    }
);

/*=========================
    INITIALIZATION
========================*/

async function initializeInvoice() {
  await loadCompanySettings();
    createAddProductButton();
    attachInputEvents();
    attachPrintEvent();
    attachSaveEvent();
    attachStatusEvents();
    calculateInvoiceTotals();
    generateInvoiceId();
    generateInvoiceDate();
    updateStatusDisplay();
    checkViewMode();
}

/* ========================
  LOAD COMPANY SETTINGS
=========================*/
async function loadCompanySettings() {
  try {
    const config = await db.get("company_config"
            );
    document.querySelector("#company-name-display").textContent = config.companyName || "";
    document.querySelector(
    "#company-tagline-display").textContent =
    config.companyTagline || "";
    document.querySelector("#company-address-display").textContent = config.companyAddress || "";
    document.querySelector("#company-phone-display").textContent = config.companyPhone || "";
    document.querySelector("#company-email-display").textContent = config.companyEmail || "";
    /*===================
      TAX RATE
    ==================*/
    currentTaxRate = Number(config.taxRate) || 10;
    /*===================
        LOGO
    =================*/
    if (config.logo) {
      const logo = document.querySelector("#company-logo-display");
      logo.src = config.logo;
      logo.style.display = "block";
    }
  } catch (error) {
    currentTaxRate = 10;
    if (error.status !== 404)
    {
      console.error("Load company settings error:", error);
    }
  }
}
async function loadCompanySettings1() {
  try {
    const config = await db.get("company_config" );
    document.querySelector( "#company-name-display").textContent =config.companyName || "";
    document.querySelector("#company-address-display").textContent = config.companyAddress || "";
    document.querySelector("#company-phone-display").textContent = config.companyPhone || "";
    document.querySelector("#company-email-display").textContent = config.companyEmail || "";
    /*===================
            LOGO
    ===================*/

   if (config.logo) {
     const logo = document.querySelector( "#company-logo-display");
     logo.src = config.logo;
     logo.style.display = "block";
   }
  } catch (error) {
    if (error.status !== 404) {
      console.error("Load company settings error:", error);
    }
  }  
}
/*=========================
    EVENTS
=========================*/

function attachInputEvents() {
    const rows = document.querySelectorAll("tbody tr");

    rows.forEach((row) => {

        attachRowEvents(row);
    });
}

function attachRowEvents(row) {

    const inputs = row.querySelectorAll("input");

    const qtyInput = inputs[1];

    const priceInput = inputs[2];

    const deleteButton = row.querySelector(".delete-btn");


    qtyInput.addEventListener("input", () => {

        updateRowTotal(row);

    });


    priceInput.addEventListener("input", () => {

        updateRowTotal(row);

    });


    deleteButton.addEventListener("click", () => {

        deleteProductRow(row);

    });

}


/*
============================
    ADD PRODUCT ROW
============================
*/

function createAddProductButton() {

    const productSection = document.querySelector(".product-section");

    const addButton = document.createElement("button");

    addButton.textContent = "Add Product";

    addButton.classList.add("btn", "add-product-btn");

    addButton.type = "button";

    addButton.addEventListener("click", () => {

        addProductRow();

    });

    productSection.appendChild(addButton);

}


function addProductRow() {

    const tbody = document.querySelector("tbody");

    const row = document.createElement("tr");

    row.innerHTML = `

        <td>
            <input type="text" placeholder="Product name">
        </td>

        <td>
            <input type="number" placeholder="0" min="0">
        </td>

        <td>
            <input type="number" placeholder="0.00" min="0" step="0.01">
        </td>

        <td>
            <input type="text" placeholder="0.00" readonly>
        </td>

        <td class="action-cell">

            <button
                class="delete-btn"
                type="button"
                title="Delete product"
            >
                🗑
            </button>

        </td>

    `;

    tbody.appendChild(row);

    attachRowEvents(row);

}


/*
========================================
    DELETE PRODUCT ROW
========================================
*/

function deleteProductRow(row) {

    const tbody = document.querySelector("tbody");

    if (tbody.rows.length === 1) {

        alert("At least one product row is required.");

        return;

    }

    row.remove();

    calculateInvoiceTotals();

}


/*
========================================
    ROW TOTAL
========================================
*/

function updateRowTotal(row) {

    const inputs = row.querySelectorAll("input");

    const quantity = parseFloat(inputs[1].value) || 0;

    const price = parseFloat(inputs[2].value) || 0;

    const total = quantity * price;

    inputs[3].value = formatCurrency(total);

    calculateInvoiceTotals();

}


/*
========================================
    INVOICE TOTALS
========================================
*/

function calculateInvoiceTotals() {

    const rows = document.querySelectorAll("tbody tr");

    let subtotal = 0;

    rows.forEach((row) => {

        const totalInput = row.querySelectorAll("input")[3];

        const rowTotal = parseFloat(
            totalInput.value.replace("$", "")
        ) || 0;

        subtotal += rowTotal;

    });

    const tax = calculateTax(subtotal);

    const grandTotal = subtotal + tax;

    updateTotalsDisplay(subtotal, tax, grandTotal);

}


/*
========================================
    TAX CALCULATION
========================================
*/
function calculateTax(subtotal) {
  return ( subtotal * currentTaxRate / 100);
}
function calculateTax1(subtotal) {

    const TAX_RATE = 0.10;

    return subtotal * TAX_RATE;

}


/*
========================================
    UPDATE DISPLAY
========================================
*/

function updateTotalsDisplay(subtotal, tax, grandTotal) {

    const totalLines = document.querySelectorAll(
        ".total-line span:last-child"
    );

    totalLines[0].textContent = formatCurrency(subtotal);

    totalLines[1].textContent = formatCurrency(tax);

    totalLines[2].textContent = formatCurrency(grandTotal);
    document.querySelector("#tax-label").textContent =`Tax (${currentTaxRate}%):`;
}

/*
========================================
    PRINT INVOICE
========================================
*/

function attachPrintEvent() {

    const printButton = document.querySelector(".print-btn");

    printButton.addEventListener("click", () => {

        printInvoice();

    });

}


function printInvoice() {

    document.body.classList.add("printing");

    setTimeout(() => {

        window.print();

    }, 300);

}


/*
========================================
    AFTER PRINT
========================================
*/

window.addEventListener("afterprint", () => {

    document.body.classList.remove("printing");

});

/*
===========================
    GET NEXT INVOICE NUMBER
===========================
*/

async function getNextInvoiceNumber() {
    try {
        const counter =
            await db.get(               "settings_invoice_counter"
            );
        return (
            counter.lastInvoiceNumber + 1
        );
    } catch (error) {
        if (error.status === 404) {
            return 1;
        }
        throw error;
    }
}

/*
===========================
    GENERATE INVOICE ID
===========================
*/

async function generateInvoiceId() {
  try {
        const invoiceIdElement =
            document.querySelector(
                "#invoice-id"
            );
        const nextNumber = await getNextInvoiceNumber();
        const
        formattedNumber = String(nextNumber)
            .padStart(3, "0");
        invoiceIdElement.textContent =
            `INV-${formattedNumber}`;
    } catch (error) {
     console.error( "Invoice ID generation error:" , error );
    }
}

/*
===========================
    UPDATE COUNTER
===========================
*/

async function updateInvoiceCounter() {
    try {
        let counter;
        try {
            counter = await db.get( "settings_invoice_counter"
                );
        } catch (error) {
            if (error.status === 404) { counter = { _id:      "settings_invoice_counter", type: "system" ,    lastInvoiceNumber: 0
                };
            } else { throw error;
            }}
        counter.lastInvoiceNumber++;
        await db.put(counter);
    } catch (error) { console.error( "Counter update error:", error );
    }
}
/*
===========================
    STATUS EVENTS 
===========================
*/
function attachStatusEvents() {

    const statusSelect =
        document.querySelector(
            "#invoice-status"
        );

    statusSelect.addEventListener(
        "change",
        () => {

        statusSelect.style.border = "";
        updateStatusDisplay();

        }
    );

}
/*
===========================
    GENERATE INVOICE DATE
===========================
*/

function generateInvoiceDate() {

    const dateElement =
        document.querySelector("#invoice-date");

    const today = new Date();

    const day = String(
        today.getDate()
    ).padStart(2, "0");

    const month = String(
        today.getMonth() + 1
    ).padStart(2, "0");

    const year = today.getFullYear();

    dateElement.textContent =
        `${day}/${month}/${year}`;

}
/*
==========================
    SAVE INVOICE
===========================
*/

function attachSaveEvent() {
    const saveButton = document.querySelector(".save-btn");
    saveButton.addEventListener("click", () => {
        saveInvoice();
    });
}

async function saveInvoice() {
      if (!validateInvoice()) { return;
    }
    try {

    const invoiceData = collectInvoiceData();
    /* Edition Mode */
    if (window.currentInvoiceDocId) {
      invoiceData._id = window.currentInvoiceDocId;
      invoiceData._rev = window.currentInvoiceRev;
    }
    const response = await db.put(invoiceData );
    
    window.location.href = `index.html?edit=${response.id}`;
    
    /* For Edition mode*/
    if ( window.currentInvoiceDocId ) {
     alert("Invoice updated successfully!");
     window.location.href = "invoicesList.html";
     return;
    }
    await updateInvoiceCounter();
      console.log("Invoice saved:",response);
      alert("Invoice saved successfully!");
      /*resetInvoiceForm();
      /*await
      generateInvoiceId();
      generateInvoiceDate();*/
   } catch (error) {
   console.error("Save error:",error
        );

        alert(
            "Failed to save invoice."
        );

    }

}

function validateInvoice() {

    /*
    ====================
        STATUS
    ====================
    */

    const statusSelect =
    document.querySelector("#invoice-status");
    if (!statusSelect.value) {
        alert(
            "Please select an invoice status."
        );

        statusSelect.focus();
        return false;
    }

    /*
    ===================
      CLIENT
    ====================
*/

  const clientInputs = document.querySelectorAll(
        ".client-section input, .client-section textarea"
    );

    const clientName =
    clientInputs[0];

    const clientAddress =
    clientInputs[1];

    const clientPhone =
    clientInputs[2];

    const clientEmail =
    clientInputs[3];

    /*
     ====================
    NAME
     ====================*/

if (!clientName.value.trim()) {
    alert(
        "Please enter the client name."
    );
    clientName.focus();
    return false;
}

    /*
     ====================
    ADDRESS
      ====================*/

    if (!clientAddress.value.trim()) {
    alert(
        "Please enter the client address."
    );
    clientAddress.focus();
    return false;
}

  /*
     ====================
    PHONE
    ====================*/

if (!clientPhone.value.trim()) {
    alert(
        "Please enter the client phone number."
    );
    clientPhone.focus();
    return false;
}

  /*
      ====================
     EMAIL
      ====================*/
if (!clientEmail.value.trim()) {
    alert(
        "Please enter the client email."
    );
    clientEmail.focus();
    return false;
}
    /*
    ====================
        PRODUCTS
    ====================
    */
    const rows = document.querySelectorAll(
            "tbody tr");
    let validProductFound =
        false;
    rows.forEach((row) => {
      const inputs = row.querySelectorAll("input");
      const productName = inputs[0].value.trim();
        const quantity = parseFloat(inputs[1].value) || 0;
        const price = parseFloat(inputs[2].value) || 0;
        if (productName &&
            quantity > 0 &&
            price > 0
        ) { validProductFound=true;
        }
      });
    if (!validProductFound) {
        alert("Please add at least one valid product.");
        return false;
    }
    return true;
}

function updateStatusDisplay() {
    const statusSelect =
        document.querySelector(
            "#invoice-status"
        );

    const statusPrint =
        document.querySelector(
            "#invoice-status-print"
        );

    if (!statusSelect.value) {
        statusPrint.textContent = "";
        return;
    }
    const selectedText =
        statusSelect.options[
            statusSelect.selectedIndex
        ].text;

    statusPrint.textContent =
        selectedText;
}

function resetInvoiceForm1() {
    /*
    ====================
        CLIENT
    ====================
    */

    const clientFields =
        document.querySelectorAll(
            ".client-section input, .client-section textarea"
        );

    clientFields.forEach((field) => {

        field.value = "";

    });

    /*
    ====================
        STATUS
    ====================
    */

    /*document.querySelector(
        "#invoice-status"
    ).value = "";*/
    const statusSelect =
    document.querySelector(
        "#invoice-status"
    );
    statusSelect.selectedIndex = 0;
    statusSelect.style.border = "";
    updateStatusDisplay();
    /*
    ====================
        PRODUCTS
    ====================
    */

    const tbody =
        document.querySelector("tbody");

    tbody.innerHTML = `
        <tr>
            <td>
                <input type="text" placeholder="Product name">
            </td>

            <td>
                <input type="number" placeholder="0" min="0">
            </td>

            <td>
                <input type="number" placeholder="0.00" min="0" step="0.01">
            </td>

            <td>
                <input type="text" placeholder="0.00" readonly>
            </td>

            <td class="action-cell">
                <button
                    class="delete-btn"
                    type="button"
                    title="Delete product"
                >
                    🗑
                </button>
            </td>
        </tr>
    `;

    /*
    ====================
        EVENTS
    ====================
    */

    attachRowEvents(
        tbody.querySelector("tr")
    );

    /*
    ====================
        TOTALS
    ====================
    */

    calculateInvoiceTotals();

}


/*
============================
    COLLECT INVOICE DATA
============================
*/

function collectInvoiceData() {

    const clientInputs = document.querySelectorAll(
        ".client-section input, .client-section textarea"
    );

    const rows = document.querySelectorAll("tbody tr");

    const products = [];

    rows.forEach((row) => {

        const inputs = row.querySelectorAll("input");

        products.push({

            product: inputs[0].value,

            quantity: parseFloat(inputs[1].value) || 0,

            price: parseFloat(inputs[2].value) || 0,

            total: inputs[3].value

        });

    });

    const totals = document.querySelectorAll(
        ".total-line span:last-child"
    );

    /*
    =======================
        DATES
    =======================
    */

   /* const now = new Date();
    const invoiceDate = now.toISOString();*/
  const now = new Date();
  /*const invoiceDate =
  window.currentInvoiceDate || now.toISOString();*/
  const invoiceDate = window.currentInvoiceDate || getLocalDateISO();
  const dueDateObject = new Date();

    dueDateObject.setDate(
        dueDateObject.getDate() + 7
    );

    const dueDate = dueDateObject.toISOString();
  /* ======================
        RETURN DOCUMENT
  ===================== */
  return {
    /*====================
      POUCHDB DOCUMENT ID
    ====================*/

        /*_id: new Date().toISOString(),*/
    _id: document.querySelector("#invoice-id").textContent,
  /* ===================
    DOCUMENT TYPE
   ====================*/
   type: "invoice",

  /* ====================
    BUSINESS INVOICE ID
   =================== */
    invoiceId: document.querySelector("#invoice-id").textContent,
   /* ====================
      DATE
      ==================*/

   invoiceDate: invoiceDate,
   dueDate: dueDate,
  /* ====================
     STATUS
   ====================*/
        /*status: "draft",*/
  status: document.querySelector("#invoice-status").value,
  taxRate: currentTaxRate,
        /*
        ====================
            METADATA
        ====================
        */

        createdAt: now.toISOString(),

        updatedAt: now.toISOString(),

        /*
        ====================
            CLIENT
        ====================
        */
        client: {
            name: clientInputs[0].value,

            address: clientInputs[1].value,

            phone: clientInputs[2].value,

            email: clientInputs[3].value

        },

        /*
        ====================
            PRODUCTS
        ====================
        */
        products: products,
        /*
        ====================
            TOTALS
        ====================
        */
        totals: {
            subtotal: totals[0].textContent,
            tax: totals[1].textContent,
            grandTotal: totals[2].textContent
        }
    };
}
/*
============================
    UTILITIES
============================
*/

function formatCurrency(amount) {

    return `$${amount.toFixed(2)}`;

}
/*
============================
    View Invoice
============================
*/
async function checkViewMode() {

    const params =
        new URLSearchParams(
            window.location.search
        );

    const viewId =
        params.get("view");

    const editId =
        params.get("edit");

    if (viewId) {

      await
      loadInvoiceForView(viewId);
      return;
    }
    if (editId) {
      await
      loadInvoiceForEdit(editId );
        return;
    }
}
async function checkViewMode1() {

    const params =
        new URLSearchParams(
            window.location.search
        );

    const invoiceId =
        params.get("view");

    if (invoiceId) {
      await loadInvoiceForView(
        invoiceId );
        return;
    }
}
async function loadInvoiceForView(
    invoiceId
) {
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
        fillInvoiceForm(
            invoice.doc
        );
        document.body.classList.add("view-mode");
        disableInvoiceForm();
    } catch (error) {
        console.error(error);
    }
}

function fillInvoiceForm(
    invoice
) {
    document.querySelector(
        "#invoice-id"
    ).textContent =
        invoice.invoiceId;
    
    document.querySelector(
    "#invoice-date"
).textContent =formatvDate(invoice.invoiceDate);
   document.querySelector(
    "#tax-label").textContent = `Tax (${invoice.taxRate || 10}%):`;

    document.querySelector(
        "#invoice-status"
    ).value =
        invoice.status;

    updateStatusDisplay();

    const clientInputs =
        document.querySelectorAll(
            ".client-section input, .client-section textarea"
        );

    clientInputs[0].value =
        invoice.client.name;
    clientInputs[1].value =
        invoice.client.address;
    clientInputs[2].value =
        invoice.client.phone;
    clientInputs[3].value =
        invoice.client.email;
        
    /*
    ====================
    PRODUCTS
    ====================
    */

const tbody =
    document.querySelector("tbody");

tbody.innerHTML = "";
invoice.products.forEach((product) => {
    const row =
        document.createElement("tr");
    row.innerHTML = `
    <td>
      <input type="text" value="${product.product}" readonly>
    </td>
    <td>
      <input type="number" value="${product.quantity}" readonly>
    </td>
    <td>
            <input
                type="number"
                value="${product.price}"
                readonly
            >
        </td>

        <td>
            <input
                type="text"
                value="${product.total}"
                readonly
            >
        </td>

        <td class="action-cell">
        </td>
    `;

    tbody.appendChild(row);
});
/*
====================
    TOTALS
====================
*/

const totalLines =
    document.querySelectorAll(
        ".total-line span:last-child"
    );

totalLines[0].textContent =
    invoice.totals.subtotal;

totalLines[1].textContent =
    invoice.totals.tax;

totalLines[2].textContent =
    invoice.totals.grandTotal;
}

function disableInvoiceForm() {

    document
        .querySelectorAll(
            "input, textarea, select"
        )
        .forEach((field) => {

            field.disabled = true;

        });

}

function formatvDate(dateString) {
  const parts = dateString.split("-");
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}
function formatvDate1(dateString) {

    const date =
        new Date(dateString);

    return date.toLocaleDateString(
        "en-GB"
    );

}
/*======= EDIT MODE =====*/

async function loadInvoiceForEdit(
    invoiceId
) {
    try {
        const result =
        await db.allDocs({ include_docs: true });

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
        fillInvoiceFormEdit(invoice.doc);
        prepareEditMode( invoice.doc);
    } catch (error) {

        console.error(error);
    }
}

function fillInvoiceFormEdit(invoice) {
  /*
  ====================
   HEADER
  ==================== */

  document.querySelector("#invoice-id").textContent = invoice.invoiceId;
    document.querySelector("#invoice-date").textContent = formatvDate(invoice.invoiceDate);
    document.querySelector("#tax-label").textContent = `Tax (${invoice.taxRate || 10}%):`;
    document.querySelector("#invoice-status"
    ).value = invoice.status;
    updateStatusDisplay();
    /*
    ====================
        CLIENT
    ====================
    */
    const clientInputs =
        document.querySelectorAll(
            ".client-section input, .client-section textarea"
        );

    clientInputs[0].value =
        invoice.client.name;

    clientInputs[1].value =
        invoice.client.address;

    clientInputs[2].value =
        invoice.client.phone;

    clientInputs[3].value =
        invoice.client.email;

    /*
    ====================
        PRODUCTS
    ====================
    */

    const tbody =
        document.querySelector("tbody");

    tbody.innerHTML = "";

    invoice.products.forEach((product) => {
        const row =
            document.createElement("tr");

        row.innerHTML = `

            <td>
                <input
                    type="text"
                    value="${product.product}"
                >
            </td>
            <td>
                <input
                    type="number"
                    value="${product.quantity}"
                    min="0"
                >
            </td>
            <td>
                <input
                    type="number"
                    value="${product.price}"
                    min="0"
                    step="0.01"
                >
            </td>
            <td>
                <input
                    type="text"
                    value="${product.total}" readonly
                >
            </td>

            <td class="action-cell">

                <button
                    class="delete-btn"
                    type="button"
                    title="Delete product"
                >
                    🗑
                </button>

            </td>

        `;

        tbody.appendChild(row);

        attachRowEvents(row);

    });

    /*
    ====================
        TOTALS
    ====================
    */
    currentTaxRate =
    invoice.taxRate || 10;
    calculateInvoiceTotals();

    /*
    ====================
     SAVE DOC ID and Date
    ====================
    */

  window.currentInvoiceDocId = invoice._id;
  window.currentInvoiceDate = invoice.invoiceDate;
}
function prepareEditMode(
    invoice
) {
    document.body.classList.add(
        "edit-mode"
    );
  window.currentInvoiceDocId = invoice._id;
  window.currentInvoiceRev =invoice._rev;
}

function getLocalDateISO() {

    const now = new Date();

    const year =
        now.getFullYear();

    const month =
        String(
            now.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            now.getDate()
        ).padStart(2, "0");

    return `${year}-${month}-${day}`;
}
