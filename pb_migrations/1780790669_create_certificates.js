// pb_migrations/1780790669_create_certificates.js
// Schema: INFRA-04 (14 fields), Index: INFRA-05 (UNIQUE on certificateCode)
// API Rules: INFRA-06 / D-10
// Reference design: D-10 (certificates collection for PPS students)
//
// SECURITY NOTE on listRule vs viewRule:
//   listRule: '@request.auth.id != ""'  — authenticated users only can LIST all certificates
//             NEVER set to null  (null = 403 for everyone including authenticated admin)
//             NEVER set to ""    (empty string = public access, exposes all DNI data)
//   viewRule: ""                        — public single-record view (anyone can verify by ID)
//             This allows certificate verification without requiring login.

migrate((app) => {
  let collection = new Collection({
    type: "base",
    name: "certificates",

    // D-10: auth required to list — never null (403 for admin), never "" (public DNI exposure)
    listRule: '@request.auth.id != ""',

    // D-10: public view — anyone can verify a certificate by its ID
    viewRule: "",

    // D-10: locked — superuser only (403 for all non-superuser requests)
    createRule: null,
    updateRule: null,
    deleteRule: null,

    fields: [
      // INFRA-04: all 14 required fields
      { name: "certificateCode", type: "text",   required: true  },
      { name: "studentName",     type: "text",   required: true  },
      { name: "dni",             type: "text",   required: true  },
      { name: "university",      type: "text",   required: true  },
      { name: "degree",          type: "text",   required: true  },
      { name: "startDate",       type: "date",   required: true  },
      { name: "endDate",         type: "date",   required: true  },
      { name: "issueDate",       type: "date",   required: true  },
      { name: "score",           type: "number", required: false },
      {
        // RESEARCH open question A1 resolution: use json not select —
        // free-form tags that don't require pre-defining a taxonomy.
        // Phase 3 (admin form) enforces structure client-side.
        name: "technologies",
        type: "json",
        required: false
      },
      {
        // Same rationale as technologies — json allows free-form competency tags
        name: "competencies",
        type: "json",
        required: false
      },
      { name: "description",    type: "text",   required: false },
      { name: "supervisorName", type: "text",   required: true  },
      {
        name: "status",
        type: "select",
        required: true,
        values: ["active", "revoked"],
        maxSelect: 1
      }
    ],

    // INFRA-05: unique index ensures no two certificates share the same code
    indexes: [
      "CREATE UNIQUE INDEX idx_certificates_code ON certificates (certificateCode)"
    ]
  });

  // Use callback parameter `app`, not global `$app` (matches official JS migrations docs)
  app.save(collection);

}, (app) => {
  // down: revert migration — drop the certificates collection
  let collection = app.findCollectionByNameOrId("certificates");
  app.delete(collection);
});
