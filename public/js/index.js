var app = {
  init: function () {
    this.todoList = [];
    this.initTodoList();
    this.bindEvent();
    this.updateCount();
    this.errorMessage = '出錯了...';
    this.csrfToken = $('meta[name=csrf_token]').attr('content');
    $.ajaxSetup({
      headers: {
        'CSRF-Token': this.csrfToken
      }
    });
    M.AutoInit();
  },
  initTodoList: function() {
    for (let todoItem of $('.todo-item')) {
      this.todoList.push({
        _id: $(todoItem).data('id'),
        body: $(todoItem).find('.todo-body').text(),
        isDone: $(todoItem).find('.done-btn > i').text() === 'check_box' ? true : false
      });
    }
  },
  bindEvent: function () {
    let self = this;
    $(document).on('click', '.done-btn', function () {
      let $this = $(this);
      let $checkbox = $this.find('i');
      let $todo = $this.parent();
      let i = self.indexOfTodo($todo.data('id'));
      if (i >= 0) {
        self.updateTodo($todo.data('id'), {isDone: !self.todoList[i].isDone}, function(result) {
          if (result.status === 'ok') {
            self.todoList[i].isDone = !self.todoList[i].isDone;
            self.render();
            self.focusInput();
          }
          M.toast({html: result.message});
        });
      } else {
        return;
      }
    });

    $(document).on('mouseenter', '.todo-item', function () {
      $editBtns = $(this).find('.edit-btns');
      $editBtns.removeClass('hide');
    });

    $(document).on('mouseleave', '.todo-item', function () {
      $editBtns = $(this).find('.edit-btns');
      $editBtns.addClass('hide');
    });

    $(document).on('keypress', 'input[name=todo]', function (e) {
      if (e.key === 'Enter') {
        if ($(e.target).val() !== '') {
          $.post('/todos', {body: $(e.target).val()}, function(result) {
            if (result.status === 'ok') {
              self.todoList.push(result.todo);
              self.render();
            } else {
              M.toast({html: result.message});
            }
          })
          .fail(function() {
            M.toast({html: self.errorMessage});
          });
          $(e.target).val('');
        }
      }
    });

    $(document).on('click', '.delete-btn', function (e) {
      let $this = $(this);
      let $todo = $this.parent().parent();
      let i = self.indexOfTodo($todo.data('id'));
      if (i >= 0) {
        $.ajax({
          url: '/todos/' + $todo.data('id'),
          method: 'DELETE',
          success: function(result) {
            if (result.status === 'ok') {
              self.todoList.splice(i, 1);
              self.render();
            }
            M.toast({html: result.message});
          }
        });
      }
    });

    $(document).on('click', '.edit-btn', function () {
      let $this = $(this);
      let $todo = $this.parent().parent();
      let i = self.indexOfTodo($todo.data('id'));
      if (i >= 0) {
        let source = $('#edit-input-template').html();
        let $editInput = $(Handlebars.compile(source)());
        $editInput.val(self.todoList[i].body);
        $todo.html('');
        $todo.append($editInput);
        $editInput.focus();
      }
    });

    $(document).on('click', '#clear-btn', function() {
      $.ajax({
        url: '/todos',
        method: 'DELETE',
        success: function(result) {
          if (result.status === 'ok') {
            self.todoList = self.todoList.filter(todo => !todo.isDone);
            self.render();
          }
          M.toast({html: result.message});
        }
      });
    });

    $(document).on('focusout', 'input[name=edit-input]', function () {
      self.render();
    });

    $(document).on('keydown', 'input[name=edit-input]', function (e) {
      if (e.key === 'Enter') {
        self.editCallback(this);
      } else if (e.key === 'Escape') {
        self.render();
      }
    });

    $(document).on('click', '.tabs', function() {
      self.render();
      self.focusInput();
    });
    $(document).on('click', '#logout-button', function(e) {
      e.preventDefault();
      $.post('/signout', function(result) {
        M.toast({
          html: result.message
        });
        setTimeout(function() {
          window.location.pathname = '/signin';
        }, 500);
      })
      .fail(function() {
        M.toast({html: self.errorMessage});
      });
    })
  },
  render: function () {
    if (this.todoList.length > 0) {
      if ($('#tabs').html().trim() === '') {
        let source = $('#tabs-template').html();
        let $tabs = $(Handlebars.compile(source)());
        $('#tabs').append($tabs);
        $('.tabs').tabs();
      }
      $('#todo-list').html('');
      let source = $('#todo-template').html();
      let template = Handlebars.compile(source);
      let todoList = this.todoList;
      switch ($('.tab > a.active').attr('id')) {
        case 'tab-active':
          todoList = todoList.filter(todo => !todo.isDone);
          break;
        case 'tab-done':
          todoList = todoList.filter(todo => todo.isDone);
          break;
      }
      for (let todo of todoList) {
        $('#todo-list').append(template(todo));
      }
      this.updateCount();
    } else {
      $('#tabs').html('');
      $('#todo-list').html('');
    }

  },
  indexOfTodo: function (id) {
    for (let i = 0; i < this.todoList.length; i++) {
      if (this.todoList[i]._id === id) {
        return i;
      }
    }
    return -1;
  },
  focusInput: function () {
    $('input[name=todo]').focus();
  },
  editCallback: function (input) {
    let self = this;
    let $this = $(input);
    let $todo = $this.parent();
    let i = this.indexOfTodo($todo.data('id'));
    let body = $this.val();
    if (i >= 0) {
      if (body !== '') {
        self.updateTodo($todo.data('id'), {body: body}, function(result) {
          if (result.status === 'ok') {
            self.todoList[i].body = body;
            self.render();
          }
          M.toast({html: result.message});
        });
      }
    }
  },
  getActiveCount: function () {
    return this.todoList.filter(function (todo) {
      return todo.isDone === false;
    }).length;
  },
  updateCount: function () {
    let total = this.todoList.length;
    let active = this.getActiveCount();
    let done = total - active;
    $('#count-all').text(total);
    $('#count-active').text(active);
    $('#nav-count-active').text(active);
    $('#count-done').text(done);
  },
  updateTodo: function(id, data, success) {
    let self = this;
    $.ajax({
      method: 'PATCH',
      url: '/todos/' + id,
      data: data,
      success: success
    })
    .fail(function() {
      M.toast({html: self.errorMessage});
    });
  }
};
$(document).ready(function() {
  app.init();
});

