/*
============================
    SETTINGS.JS
============================
*/

const db = new PouchDB("invoiceDB");

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        await loadSettings();

        attachEvents();
    }
);

/*
============================
    LOAD SETTINGS
============================
*/

async function loadSettings() {

    try {

        const config =
            await db.get(
                "company_config"
            );

        document.querySelector(
            "#company-name"
        ).value =
            config.companyName || "";

     document.querySelector(
    "#company-tagline"
).value =
    config.companyTagline || "";
        document.querySelector(
            "#company-address"
        ).value =
            config.companyAddress || "";

        document.querySelector(
            "#company-phone"
        ).value =
            config.companyPhone || "";

        document.querySelector(
            "#company-email"
        ).value =
            config.companyEmail || "";

        document.querySelector(
            "#vat-rate"
        ).value =
            config.taxRate || 10;

        if (config.logo) {

            document.querySelector(
                "#logo-preview"
            ).src =
                config.logo;

            document.querySelector(
                "#logo-preview"
            ).style.display =
                "block";
        }

    } catch (error) {

        if (error.status !== 404) {

            console.error(
                "Load settings error:",
                error
            );
        }
    }
}

/*
============================
    EVENTS
============================
*/

function attachEvents() {

   attachNavigation();
    document
        .querySelector(
            "#company-logo"
        )
        .addEventListener(
            "change",
            previewLogo
        );

    document
        .querySelector(
            "#save-settings-btn"
        )
        .addEventListener(
            "click",
            saveSettings
        );

    document
        .querySelector(
            "#export-db-btn"
        )
        .addEventListener(
            "click",
            exportDatabase
        );

    document
    .querySelector("#restore-db-btn")
    .addEventListener(
        "click",
        () => {
            document
                .querySelector("#restore-file")
                .click();
        }
    );
    document
    .querySelector("#restore-file")
    .addEventListener(
        "change",
        importDatabase
    );

    document
        .querySelector(
            "#initialize-db-btn"
        )
        .addEventListener(
            "click",
            initializeDatabase
        );
}

/*
============================
    NAVIGATION
============================
*/

function attachNavigation() {

    const companyBtn =
        document.querySelector(
            "#show-company-btn"
        );

    const dataBtn =
        document.querySelector(
            "#show-data-btn"
        );

    const companySection =
        document.querySelector(
            "#company-section"
        );

    const dataSection =
        document.querySelector(
            "#data-section"
        );

    companyBtn.addEventListener(
        "click",
        () => {

            companySection.style.display =
                "block";

            dataSection.style.display =
                "none";
        }
    );

    dataBtn.addEventListener(
        "click",
        () => {

            companySection.style.display =
                "none";

            dataSection.style.display =
                "block";
        }
    );
}
/*
============================
    LOGO PREVIEW
============================
*/
function previewLogo(event) {

    const file =
        event.target.files[0];

    if (!file) return;

    /*
    ====================
        FILE TYPE
    ====================
    */

    const allowedTypes = [
        "image/png",
        "image/jpeg",
        "image/jpg"
    ];

    if (
        !allowedTypes.includes(
            file.type
        )
    ) {

        alert(
            "Only PNG and JPG files are allowed."
        );

        event.target.value = "";

        return;
    }

    /*
    ====================
        FILE SIZE
    ====================
    */

    const maxSize =
        500 * 1024;

    if (
        file.size > maxSize
    ) {

        alert(
            "Logo size must not exceed 500 KB."
        );

        event.target.value = "";

        return;
    }

    /*
    ====================
        DIMENSIONS
    ====================
    */

    const image =
        new Image();

    image.onload =
        function () {

            if (
                image.width > 600 ||
                image.height > 300
            ) {

                alert(
                    "Maximum logo dimensions are 600 x 300 pixels."
                );

                event.target.value = "";

                return;
            }

            const reader =
                new FileReader();

            reader.onload =
                function (e) {

                    const preview =
                        document.querySelector(
                            "#logo-preview"
                        );

                    preview.src =
                        e.target.result;

                    preview.style.display =
                        "block";
                };

            reader.readAsDataURL(
                file
            );
        };

    image.src =
        URL.createObjectURL(
            file
        );
}
function previewLogo1(event) {

    const file =
        event.target.files[0];

    if (!file) return;

    const reader =
        new FileReader();

    reader.onload =
        function (e) {

            const preview =
                document.querySelector(
                    "#logo-preview"
                );

            preview.src =
                e.target.result;

            preview.style.display =
                "block";
        };

    reader.readAsDataURL(file);
}

/*
============================
    SAVE SETTINGS
============================
*/

async function saveSettings() {

    try {

        let config;

        try {

            config =
                await db.get(
                    "company_config"
                );

        } catch (error) {

            if (error.status === 404) {

                config = {
                    _id: "company_config",
                    type: "config"
                };

            } else {

                throw error;
            }
        }

        /*
        ====================
            TYPE
        ====================
        */

        config.type = "config";

        /*
        ====================
            COMPANY INFO
        ====================
        */

        config.companyName =
            document.querySelector(
                "#company-name"
            ).value.trim();
      config.companyTagline =
    document.querySelector(
        "#company-tagline"
    ).value.trim();

        config.companyAddress =
            document.querySelector(
                "#company-address"
            ).value.trim();

        config.companyPhone =
            document.querySelector(
                "#company-phone"
            ).value.trim();

        config.companyEmail =
            document.querySelector(
                "#company-email"
            ).value.trim();

        /*
        ====================
            VAT RATE
        ====================
        */

        config.taxRate =
            parseFloat(
                document.querySelector(
                    "#vat-rate"
                ).value
            ) || 10;

        /*
        ====================
            LOGO
        ====================
        */

        const logoPreview =
            document.querySelector(
                "#logo-preview"
            );

        if (
            logoPreview.src &&
            logoPreview.src.startsWith(
                "data:image"
            )
        ) {

            config.logo =
                logoPreview.src;
        }

        /*
        ====================
            SAVE
        ====================
        */

        await db.put(config);

        alert(
            "Settings saved successfully."
        );

    } catch (error) {

        console.error(
            "Save settings error:",
            error
        );

        alert(
            "Failed to save settings."
        );
    }
}

/* To be deleted*/
async function saveSettings1() {
  try {
    let config;
    try {
    config = await db.get("company_config"
                );
     } catch (error) {
    config = {
      _id: "company_config"
            };
    }
    config.companyName = document.querySelector("#company-name").value;
     config.companyAddress = document.querySelector(
                "#company-address"
            ).value;

        config.companyPhone =
            document.querySelector(
                "#company-phone"
            ).value;

        config.companyEmail =
            document.querySelector(
                "#company-email"
            ).value;

        config.taxRate =
            parseFloat(
                document.querySelector(
                    "#vat-rate"
                ).value
            ) || 10;

        const logoPreview =
            document.querySelector(
                "#logo-preview"
            );

        if (
            logoPreview.src &&
            logoPreview.src.startsWith(
                "data:image"
            )
        ) {
            config.logo =
                logoPreview.src;
        }

        await db.put(config);

        alert(
            "Settings saved successfully."
        );

    } catch (error) {

        console.error(
            "Save settings error:",
            error
        );

        alert(
            "Failed to save settings."
        );
    }
}

/*
============================
    EXPORT DATABASE
============================
*/

async function exportDatabase() {

    if (
        !confirm(
            "Export the database?"
        )
    ) {
        return;
    }

    try {

        const result =
            await db.allDocs({
                include_docs: true
            });
        const data =
            result.rows.map(
                row => row.doc
            );

        const blob =
            new Blob(
                [
                    JSON.stringify(
                        data,
                        null,
                        2
                    )
                ],
                {
                    type:
                        "application/json"
                }
            );

        const url =
            URL.createObjectURL(
                blob
            );

        const a =
            document.createElement(
                "a"
            );

        a.href = url;

        a.download = "InvoiceBackup.json";

        a.click();

        URL.revokeObjectURL(
            url
        );

    } catch (error) {

        console.error(
            "Export error:",
            error
        );
    }
}

/*
============================
    IMPORT DATABASE
============================
*/
async function importDatabase(event) {

    const file =
        event.target.files[0];

    if (!file) {
        alert(
            "No file selected."
        );
        return;
    }

    if (
        !confirm(
            "This operation will replace the current database.\n\nContinue?"
        )
    ) {
        return;
    }

    try {

        /*
        ====================
        READ BACKUP FILE
        ====================
        */

    const text = await file.text();
    const docs = JSON.parse(text);
    if (!Array.isArray(docs)) {
      alert( "Invalid backup file." );
      return;
    }

        /*
        ====================
        CLEAR CURRENT DATABASE
        ====================
        */

        const existingDocs =
            await db.allDocs({
                include_docs: true
            });

        for (
            const row of existingDocs.rows
        ) {

            await db.remove(
                row.doc
            );
        }

        /*
        ====================
        IMPORT DOCUMENTS
        ====================
        */

        for (
            const doc of docs
        ) {

            delete doc._rev;

            await db.put(doc);
        }

        alert(
            "Database restored successfully."
        );
        location.reload();

    } catch (error) {

        console.error(
            "Import error:",
            error
        );

        alert(
            "Failed to restore database."
        );
    }
}
async function importDatabase2(event) {

    const file =
        event.target.files[0];

    if (!file) {

        alert(
            "No file selected."
        );

        return;
    }

    alert(
        "Selected file: " +
        file.name
    );

    if (
        !confirm(
            "Restore database from selected file?"
        )
    ) {
        return;
    }

    try {

        const text =
            await file.text();

        const docs =
            JSON.parse(text);

        alert(
            "Documents found: " +
            docs.length
        );

        for (
            const doc of docs
        ) {

            try {

                const existing =
                    await db.get(
                        doc._id
                    );

                doc._rev =
                    existing._rev;

            } catch {}

            await db.put(doc);
        }

        alert(
            "Database restored successfully."
        );

        location.reload();

    } catch (error) {

       /* console.error(error);*/
       alert(
    "Import error: " +
    error.message
);

        alert(
            "Failed to restore database."
        );
    }
}
async function importDatabase1(event) {
  const file = event.target.files[0];
  alert("file is :"+ file);
  
  if (!file) return;
  
  if (!confirm("Restore database from selected file?"
  )
  ) { return;}
  try {
    const text = await file.text();
    const docs = JSON.parse(text);
    for ( const doc of docs ) 
    {
      try {
        const existing =
        await db.get(doc._id);
        doc._rev = existing._rev;
      } catch { }
        await db.put(doc);
      }
      alert("Database restored successfully.");
        location.reload();
      } catch (error) { console.error( "Import error:", error); 
      alert( "Failed to restore database.");
    }
}

/*
============================
    INITIALIZE DATABASE
============================
*/

async function initializeDatabase() {
    const confirmed =
        confirm(
            "WARNING!\n\nAll invoices and settings will be permanently deleted.\n\nContinue?"
        );

    if (!confirmed) {
        return;
    }

    try {

        await db.destroy();

        alert(
            "Database initialized successfully."
        );

        location.reload();

    } catch (error) {

        console.error(
            "Initialization error:",
            error
        );

        alert(
            "Failed to initialize database."
        );
    }
}
