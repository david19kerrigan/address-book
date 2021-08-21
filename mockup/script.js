// Address Book class
function AddressBook() {
    this.contacts = [];
}

AddressBook.prototype.setContact = function (contact) {
    this.contacts.push(contact);
};

// Necessary for null checking
AddressBook.prototype.getContact = function (id) {
    if (this.contacts[id]) {
        return this.contacts[id];
    }
    else{
        return false;
    }
};

// Contact class
function Contact(name, work, school, picture) {
    this.name = name;
    // Assume only one school and workplace entry
    this.workInstitution = work[0]["institution"];
    this.workStartYear = work[0]["startYear"];
    this.workTitle = work[0]["title"];
    this.schoolInstitution = school[0]["institution"];
    this.schoolStartYear = school[0]["startYear"];
    this.schoolEndYear = school[0]["endYear"];
    this.schoolDegree = school[0]["degree"];
    this.picture = picture;
}

// API request
function getJson() {
    m.request({
        method: "GET",
        url: "http://localhost:8080/api/people"
    })
        .then(function (myJson) {
            // File contacts to address book
            for (var index in myJson['people']) {
                var contact = new Contact(myJson['people'][index]['name'], myJson['people'][index]['workExperience'], myJson['people'][index]['education'], myJson['people'][index]['image']);
                addressBook.setContact(contact);
                // File dividers to address book
                if (!dividers.includes(contact.name.charAt(0))) {
                    dividers.push(contact.name.charAt(0));
                    addressBook.setContact(contact.name.charAt(0));
                }
            }
            SortContacts();
        })
}

// Sort address book
function SortContacts() {
    addressBook.contacts.sort(function (a, b) {
        var nameA = typeof a == "string" ? a : a.name.toUpperCase();
        var nameB = typeof b == "string" ? b : b.name.toUpperCase();
        if (nameA < nameB) {
            return order * -1;
        }
        if (nameA > nameB) {
            return order;
        }
        return 0;
    })
    // Move the dividers backwards one index
    if (order == -1) {
        for (var index = 0; index < addressBook.contacts.length; index++) {
            if (typeof addressBook.getContact(index) == "string") {
                var temp = addressBook.getContact(index - 1);
                addressBook.contacts[index - 1] = addressBook.getContact(index);
                addressBook.contacts[index] = temp;
            }
        }
    }
}

// Global vars
var addressBook = new AddressBook();
var currentKey;
var dividers = [];
var order = 1;

// Mithril component
var App = {
    oninit: function () {
        getJson();
    },
    view: function () {
        return m("div", { class: "app-address-book" }, [
            m("div", { class: "app-directory-container" },
                m("div", { class: "app-directory" }, [
                    m("div", {
                        onclick: function () {
                            // Reverse order and sort
                            order *= -1;
                            prevName = addressBook.getContact(currentKey).name
                            SortContacts();
                            // Modify currentKey so we stay on the same contact
                            if (prevName) {
                                for (var index = 0; index < addressBook.contacts.length; index++) {
                                    if (addressBook.getContact(index).name == prevName) {
                                        currentKey = index;
                                    }
                                }
                            }
                        }, class: "app-directory-sort"
                    }, order == 1 ? "A-Z" : "Z-A"),
                    m("div", Object.keys(addressBook.contacts).map(function (key, index) {
                        // Display divider
                        if (typeof addressBook.getContact(key) == "string") {
                            return m("div", { class: "app-directory-separator" }, addressBook.getContact(key));
                        }
                        // Display contact
                        return m("div", { onclick: function () { currentKey = key }, class: "app-directory-item" }, addressBook.getContact(key).name);
                    }))
                ])
            ),
            m("div", { class: "app-person-profile-container" },
                m("div", { class: "app-person-profile docs-highlight docs-blue", dataIntro: "Person Profile", dataPosition: "bottom" }, [
                    m("div", { class: "app-person-profile-header" }, [
                        m("div", { class: currentKey != null ? "app-person-profile-photo" : null, style: `background-image: url(${addressBook.getContact(currentKey).picture}` }),
                        m("h2", addressBook.getContact(currentKey).name)
                    ]),
                    m("div", { class: "app-section" }, [
                        m("div", { class: "app-section-header" }, [
                            m("h3", currentKey != null ? "Education" : null),
                            m("div", { class: "app-section-body" },
                                m("div", { class: "app-history-item" }, [
                                    m("div", { class: "app-history-item-dates" },
                                        m("div", currentKey != null ? addressBook.getContact(currentKey).schoolStartYear + "-" + addressBook.getContact(currentKey).schoolEndYear : null)
                                    ),
                                    m("div", { class: "app-history-item-body" }, [
                                        m("div", { class: "app-history-item-title" }, addressBook.getContact(currentKey).schoolInstitution),
                                        m("div", addressBook.getContact(currentKey).schoolDegree)
                                    ])
                                ])
                            )
                        ])
                    ]),
                    m("div", { class: "app-section" }, [
                        m("div", { class: "app-section-header" }, [
                            m("h3", currentKey != null ? "Work History" : null),
                            m("div", { class: "app-section-body" },
                                m("div", { class: "app-history-item" }, [
                                    m("div", { class: "app-history-item-dates" },
                                        m("div", currentKey != null ? addressBook.getContact(currentKey).workStartYear + "-Present" : null)
                                    ),
                                    m("div", { class: "app-history-item-body" }, [
                                        m("div", { class: "app-history-item-title" }, addressBook.getContact(currentKey).workInstitution),
                                        m("div", addressBook.getContact(currentKey).workTitle)
                                    ])
                                ])
                            )
                        ])
                    ])
                ])
            )
        ])
    }
}

// Mount component
m.mount(document.body, App);