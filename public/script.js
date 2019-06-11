'use strict';



function checkSession() {
  const sessionToken = sessionStorage.getItem('sessionToken');
  if (sessionToken) {
    refreshSession();
  }
}

function refreshSession() {
  api.getAllEntries(getAllEntriesSuccess); 
  hideLogin();
  $('#navbar').removeClass('hidden');
  $('.action-title').removeClass('hidden');
}



window.addEventListener('popstate', function (event) {
  let state = JSON.stringify(event.state);
  if (state.includes('new')) {
    showNewPost();
  }
  else if (state.includes('modify')) {
    historyAPI.expired();
  }
  else if (state.includes('viewall')) {
    api.getAllEntries(getAllEntriesSuccess);
  }
  else if (state.includes('response')) {
    displayLinks();
  }
  else if (state.includes('expired')) {
    historyAPI.expired();
  }
});



const MAIN_ENTRY = [];

function clearMAIN_ENTRY() {
  MAIN_ENTRY.length = 0;
}

function storeMAIN_ENTRY(entries) {
  MAIN_ENTRY.length = 0;
  for (let i = 0; i < entries.length; i++) {
    MAIN_ENTRY.push({postId: i, databaseId: entries[i].id, title: entries[i].title, content: entries[i].content, date: entries[i].contentDate, tags: entries[i].tags});
  }
}

function updateMAIN_ENTRY(entry, postId) {
  let objIndex = MAIN_ENTRY.findIndex((entry => entry.postId == postId));
  MAIN_ENTRY[objIndex].databaseId = entry.id;
  MAIN_ENTRY[objIndex].title = entry.title;
  MAIN_ENTRY[objIndex].content = entry.content;
  MAIN_ENTRY[objIndex].date = entry.contentDate;
  MAIN_ENTRY[objIndex].tags = entry.tags;
}

// Login

function watchLogin() {
  $('.login-container').on('submit', '.js-login-form', event => {
    event.preventDefault();
    const username = $('#username').val();
    const pass = $('#pass').val();
    api.login(username, pass, loginSuccess);
  });
}

function loginSuccess(res) {
  sessionStorage.setItem('sessionToken', res.authToken);
  hideLogin();
  showNewPost();
}

// Registration

function watchRegister() {
  $('.register').on('click', event => {
    event.preventDefault();
    showRegistrationForm();
  });
}

function showRegistrationForm() {
  $('#email').removeClass('hidden');
  $('legend').text('Please, register below.');
  $('#btnlogin').text('Register');
  $('.js-login-form').removeClass('js-login-form').addClass('js-register-form');
  $('.login-register-text').html('Have an account? <a href=".">Login.</a>');
}

function watchRegistrationForm() {
  $('.login-container').on('submit', '.js-register-form', event => {
    event.preventDefault();
    const user = $('#username').val();
    const pass = $('#pass').val();
    const email = $('#email-field').val();
    api.register(user, pass, email);
  });
}

// Create new post


function hideLogin() {
  $('#login-page').addClass('hidden');
  $('#h1-login').addClass('hidden');
}

function hideViewAll() {
  $('#view-all-page').removeClass('hidden');
  $('#view-all-page').addClass('hidden');
}

function watchNewPostLink() {
  $('.new-post').on('click', event => {
    showNewPost();
    historyAPI.historyStateNew();
  });
}


function showNewPost() {
  $('#navbar').removeClass('hidden');
  $('#entry-page').removeClass('hidden');
  $('.action-title').removeClass('hidden');
  $('h3').text('New Post');
  $('input').val('');
  $('textarea').val('');
  hideViewAll();
  hideResponseLinks();
}

function watchPost() {
  $('.js-post-form').on('submit', event => {
    event.preventDefault();

  
    const kidName = $ ('#name').val();
    const entryDate = $('#date').val();
    const title = $('#title').val();
    const entryNew = $('#entry').val();
    const entryHashtags = $('#hashtags').val();
    api.postEntry(title, entryNew, entryDate, entryTags, newPostResponse);
  });
}


function newPostResponse() {
  $('h3').text(' Post created successfully');
  historyAPI.historyStateResponse();
  displayLinks();
}



function watchViewAllLink() {
  $('.display-all').on('click', event => {
    api.getAllEntries(getAllEntriesSuccess);
    historyAPI.historyStateViewAll();
  });
}

function hideNewPost() {
  $('#entry-page').addClass('hidden');
}

function showViewAll() {
  $('#view-all-page').removeClass('hidden');
  $('h3').text('Journal Entries');
}



function getAllEntriesSuccess(res) {
  $('#view-all-page').html('');
  clearMAIN_ENTRY();
  displayAllEntries(res); 
}

function displayAllEntries(entries) {
  hideNewPost();
  hideResponseLinks();
  showViewAll();
  entryTemplate(entries);
  storeMAIN_ENTRY(entries);
}



function entryTemplate(entries) {
  templates.generateEntryTemplate(entries); 
}



function watchUpdate() {
  $('#view-all-page').on('click', '.btnupdate', function(btn) {
    let id = btn.target.id;
    findPostForUpdate(id);
  });
}



function findPostForUpdate(id) {
  let obj = MAIN_ENTRY.find(function(o) {
    return o.postId == id; 
  });
  sendPostForUpdate(obj, id);
}



function sendPostForUpdate(entry, id) {
  let title = entry.title;
  let content = entry.content;
  let date = entry.date;
  let tags = entry.tags;
  let postId = id;
  updateView(title, content, date, tags, postId);
}

// Generate update post view with the post's existing information editable in the inputs

function updateView(title, content, date, tags, postId) {
  historyAPI.historyStateModify();
  templates.generateUpdateEditForm(title, content, date, tags, postId);
}

function watchSaveEntry() {
  $('#view-all-page').on('click', '.btnsave', function(btn) {
    let id = btn.target.id;
    getUpdateValues(id);
  });
}

// Send updated info to API to post update

function getUpdateValues(id) {
  const obj = MAIN_ENTRY.find(function(o) {
    return o.postId == id;
  });
  const postId = id;
  const databaseId = obj.databaseId;
  const titleUpdate = $('#titleUpdate').val();
  const entryUpdate = $('#dreamentryUpdate').val();
  const entryDateUpdate = $('#dreamdateUpdate').val();
  const entryTagsUpdate = $('#tagsUpdate').val();
  api.updateEntry(titleUpdate, entryUpdate, entryDateUpdate, entryTagsUpdate, databaseId, postId, viewUpdatedPost);
}

// Upon successful update, updated post is viewed

function viewUpdatedPost(entry, id) {
  historyAPI.historyStateModify();
  updateMAIN_ENTRY(entry, id);
  templates.generateUpdateTemplate(entry, id);
}

// Delete post

function watchDelete() {
  $('#view-all-page').on('click', '.btndelete', function(btn) {
    historyAPI.historyStateModify();
    let id = btn.target.id;
    event.preventDefault();
    let deleteConfirmation = confirm('Are you sure you want to delete this entry?');
    if (deleteConfirmation === true) {
      findPostForRemoval(id);
    }
  });
}

// Search client storage for post to be deleted

function findPostForRemoval(id) {
  let obj = MAIN_ENTRY.find(function(o) {
    return o.postId == id; 
  });
  sendPostForRemoval(obj);
}

// Send post ID for deletion

function sendPostForRemoval(entry) {
  let databaseId = entry.databaseId;
  api.deleteEntry(databaseId, postDeletedResponse);
}

function postDeletedResponse() {
  $('h3').text('Post removed successfully');
  historyAPI. historyStateModify();
  displayLinks();
}

// Sign out

function watchSignOut() {
  $('.sign-out').on('click', event => {
    api.signOut();
    sessionStorage.removeItem('sessionToken');
  });
}

// Toggles successful (delete/update) response view

function hideResponseLinks() {
  $('.response-container').addClass('hidden');
}

function displayLinks() {
  $('#entry-page').addClass('hidden');
  $('#view-all-page').addClass('hidden');
  $('.response-container').removeClass('hidden');
}

// Calendar input

$('body').on('focus', '.date-field', function(){
  $(this).datepicker();
});

// jQuery events

$(watchLogin);
$(watchPost);
$(watchRegister);
$(watchRegistrationForm);
$(watchNewPostLink);
$(watchViewAllLink);
$(watchUpdate);
$(watchDelete);
$(watchSaveEntry);
$(watchSignOut);
$(checkSession);
