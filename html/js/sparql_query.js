/**********************************************************************************************
* Codice per eseguire una query della canzone su spotify (per usare il risultato con dbpedia) *
***********************************************************************************************/

/* funzioni di callback */

function printOut(data){ //stampa i dati della canzone su Info (artista, anno...)

  function clickable_info(toSearch){
    document.getElementById("search-query-value").value=toSearch.data.par;
    SearchLogic();
  }

  $('#info-name').text(data.name);
  $('#info-name').click({par: data.name}, clickable_info); //posso passare par alla funzione clickable_info come primo parametro attuale.
  $('#info-art').text(data.artist);
  $('#info-art').click({par: data.artist}, clickable_info);
  $('#info-year').text(data.year);
  $('#info-year').click({par: data.year}, clickable_info);
  $('#info-album').text(data.album);
  $('#info-album').click({par: data.album}, clickable_info);
}

function extract_data(data){ //prende i risultati della query a spotify e estrae alcuni dati; calcola un URL e chiama una funzione che fa una richiesta AJAX.
  //estrapolo i dati
  var songInfo = {titolo: "", album: "", artista: ""}
  titolo = "\""+data['name']+"\"";
  album = "\""+data['album']+"\"";
  artista = "\""+data['artist']+"\"" ;
  //scrivo la query

  var dbpedia_query_text = [
    "SELECT DISTINCT ?n_song ?n_artist ?n_album ?d_song ?d_artist ?d_album ?wikipedia_s ?wikipedia_ar ?wikipedia_al WHERE {",
    "OPTIONAL { ?n_song foaf:name ",titolo,"@en ; rdf:type dbo:Song ; dbo:abstract ?d_song ; foaf:isPrimaryTopicOf ?wikipedia_s . ",
    "FILTER (lang(?d_song) = 'en') } ",
    "OPTIONAL { ?n_artist foaf:name ",artista,"@en ; rdf:type dbo:Agent ; rdf:type schema:MusicGroup ; dbo:abstract ?d_artist ; foaf:isPrimaryTopicOf ?wikipedia_ar . ",
    "FILTER (lang(?d_artist) = 'en') } ",
    "OPTIONAL { ?n_album foaf:name ",album,"@en ; rdf:type schema:MusicAlbum ; dbo:abstract ?d_album ; foaf:isPrimaryTopicOf ?wikipedia_al . ",
    "FILTER (lang(?d_album) = 'en') } ",
    "}"
  ].join(" ");

  //trasformo la query in un URL.
  var url = "http://dbpedia.org/sparql";
  var queryUrl = url + "?query=" + encodeURIComponent(dbpedia_query_text) + "&format=json";
  dbpedia_query(queryUrl);
}

function dbpedia_query(q_url){
  $.ajax({
    url: q_url,
    data: {
      format: 'json'
    },
    type: 'GET',

    success: function(data) {
      display_wikipedia(data);
    },
    error: function(data) {
      console.log("dbpedia query: error" + JSON.stringify(data));
    }
  });
}

function display_wikipedia(data){ //funzione che stampa effettivamente i dati sulla sezione di wikipedia del visualizer
  //reset di quello che c'è dentro #pills-display_wikipedia
  $('#pills-wikipedia').html("");
  if (JSON.stringify(data.results.bindings[0]) == "{}"){ //"Musica Per Bambini - Preghiera Delle Palle Di Neve" trova un risultato vuoto (non stampando quindi nesusn testo d'errore)
    $('#pills-wikipedia').text("Can't find any data about this song :-(");
    return;
  }
  //creo di carosello
  var cdiv = '<div id="caroselloInfoWiki" class="carousel slide" data-ride="carousel" style="height: 320px !important;  overflow:auto;"></div>'; //è l'altezza che occupa 1000 caratteri di testo
  $('#pills-wikipedia').append(cdiv);
  //inserisco lista di dot per la navigazione e carousel-inner
  var nav = '<ol id="appendSomeButtons" class="carousel-indicators"> </ol>';
  var inner = '<div id="appendSomeText" style="padding: 5%;" class="carousel-inner"></div>';
  var controls = '<a class="carousel-control-prev" href="#caroselloInfoWiki" role="button" data-slide="prev" style="width: 5% !important;"> \
                  <span class="carousel-control-prev-icon"></span> </a> \
                  <a class="carousel-control-next" href="#caroselloInfoWiki" role="button" data-slide="next" style="width: 5% !important;"> \
                  <span class="carousel-control-next-icon"></span> </a>'
  $('#caroselloInfoWiki').append(nav, inner, controls);
  $('#caroselloInfoWiki').on('slide.bs.carousel', function(){
//    console.log("INIZIO A SCORRERE");
    $('#appendSomeText > .carousel-item').addClass("d-none"); //nasconde l'elemento
  });

  $('#caroselloInfoWiki').on('slid.bs.carousel', function(){
    $('#appendSomeText > .carousel-item').removeClass("d-none"); //nasconde l'elemento
  });

  let i = 0; var once=0; var wiki_info = []; var MAX="800";
  while(data.results.bindings[i] && i < 1){ //mostriamo massimo 2 insiemi di risultati (6 elementi)
    let x=data.results.bindings[i];
    let keepreading = "";
    if (x.wikipedia_s){
      keepreading = '... <a href="' + x.wikipedia_s.value + '" target="_blank"> Keep reading on Wikipedia</a>';
      wiki_info.push(x.d_song.value.substring(0, MAX) + keepreading);
    }
    if (x.wikipedia_ar){
      keepreading = '... <a href="' + x.wikipedia_ar.value + '" target="_blank"> Keep reading on Wikipedia</a>';
      wiki_info.push(x.d_artist.value.substring(0, MAX) + keepreading);
    }
    if (x.wikipedia_al){
      keepreading = '... <a href="' + x.wikipedia_al.value + '" target="_blank"> Keep reading on Wikipedia</a>';
      wiki_info.push(x.d_album.value.substring(0, MAX)+ keepreading);
    }
    i += 1;
  }
  //popolo il carosello
  i=wiki_info.length-1;
  while (i >= 0){
    //testo
    var inner_div;
    //bottoni di controllo
    var li;
    if (i==0){
      inner_div = '<div class="carousel-item active">';
      li = '<li data-target="#caroselloInfoWiki" data-slide-to="' + i + '"class="active"></li>'
    }
    else{
      inner_div = '<div class="carousel-item">'
      li = '<li data-target="#caroselloInfoWiki" data-slide-to="' + i + '" ></li>'
    }
    inner_div += wiki_info[i] + '</div>';
    $('#appendSomeText').prepend(inner_div);
    $('#appendSomeButtons').prepend(li);
    i -= 1;

  }
}

/************************/

/* funzione che effettua la query a spotify */

function getSongInfo(videoname, fun, display_error){ //questa funzione serve sia per la query su dbpedia, ma anche per inserire informazioni nella homepage.
  //out è una variabile booleana: se 1, stampa output su #pills-info, altrimenti restituiscilo solo.
  videoname = encodeURI(parseCurrentVideo(videoname));
  $.ajax({
    		url: 'http://localhost/api/spotify/infocanzone?video=' + videoname,
    success: function (data){
	if(fun)
	  fun(data);
    },
    error: function(data) {
      console.log("getSongInfo (sparql_query.js): error: " + JSON.stringify(data));
      //display an error message
      $('#pills-wikipedia').html("Can't find any data about this song :-("); //se non trovo informazioni a questo punto, la query su dbpedia non parte, quindi stampo subito un errore
      if (display_error)
        $('#pills-info').html("Can't find any info about this song :("); //non devo sempre mostrare l'errore, ma solo se la funzione viene chiamata
                                                                                               //per la prima volta (la seconda volta viene chiamata da wikipedia e se mostrassi
                                                                                               //l'errore comparirebbe due volte)
    }
  });
}

/**************************************************************************
* Codice per il reperimento di info su canzone/album/artista su wikipedia *
************************************************************************* */

function wikipedia(videoname){ //funzione che attiva una serie di callback per eseguire una query a dbpedia e mostrare il risultato
  $('#pills-wikipedia').text("")
  $('#chooseText').html(""); //resetto i bottoni
  getSongInfo(videoname, extract_data, true);
}
