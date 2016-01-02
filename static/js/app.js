require([
  'static/js/jquery.js',
  'static/js/mustache.js',
  'static/js/lunr.js',
  'text!templates/story_view.mustache',
  'text!templates/story_list.mustache',
  'text!RRH.json',
  'text!RRH_index.json'
], function (_, Mustache, lunr, storyView, storyList, data, indexDump) {

  var renderStoryList = function (qs) {
    $("#story-list-container")
      .empty()
      .append(Mustache.to_html(storyList, {stories: qs}))
  }

  var renderStoryView = function (story) {
    story.pars = story.body.split("\n\n");
    story.pars = story.pars.map(function (par) { return {paragraph: par.split("\n")}; });
    $("#story-view-container")
      .empty()
      .append(Mustache.to_html(storyView, story))
  }

  window.profile = function (term) {
    console.profile('search')
    idx.search(term)
    console.profileEnd('search')
  }

  window.search = function (term) {
    console.time('search')
    idx.search(term)
    console.timeEnd('search')
  }

  var indexDump = JSON.parse(indexDump)
  console.time('load')
  window.idx = lunr.Index.load(indexDump)
  console.timeEnd('load')

  var stories = JSON.parse(data).stories.map(function (raw) {
    return {
      idnumber: raw.idnumber,
      title: raw.title,
      body: raw.body,
      year: raw.year,
      author: raw.author,
      collaborator: raw.collaborator
    }
  })

  function sortByKey(array, key) {
    return array.sort(function(a, b) {
        var x = a[key]; var y = b[key];
        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    });
   }

  console.log(stories.length);
  var currentIndex = 0;

  stories = sortByKey(stories, 'year');

  renderStoryList(stories)
  renderStoryView(stories[0])
  
  $(document).keydown(function (e) {
      if (document.activeElement.type !== "search") {
      switch (e.keyCode) {
          case 37:
            if (currentIndex > 0) {
              currentIndex -= 1;
            }
            renderStoryView(stories[currentIndex]);
            break;
          case 39:
            if (currentIndex < stories.length) {
                currentIndex += 1;
            }
            renderStoryView(stories[currentIndex]);
            break;
      }
    }
  });

  $(document).keyup(function(e) {
       if (e.keyCode == 27) { 
            renderStoryList(stories)
            $('input').val('')
      }
  })

  var debounce = function (fn) {
    var timeout
    return function () {
      var args = Array.prototype.slice.call(arguments),
          ctx = this

      clearTimeout(timeout)
      timeout = setTimeout(function () {
        fn.apply(ctx, args)
      }, 100)
    }
  }

  $('input').bind('keyup', debounce(function () {
    if ($(this).val() < 2) return
    var query = $(this).val()
    var results = idx.search(query).map(function (result) {
      return stories.filter(function (s) { return s.idnumber === result.ref })[0]
    })
    renderStoryList(results)
  }))

  $("#story-list-container").delegate('li', 'click', function () {
    var li = $(this)
    var idnumber = li.data('story-id')

    renderStoryView(stories.filter(function (story) {
      return (story.idnumber == idnumber)
    })[0])
  })

})