/**************************
 Recherche - RECA
 Debug: voir une page de résultats en particulier
 @param startpage
 ex. https://admission.umontreal.ca/programmes-detudes/?startpage=20
 **************************/

var udemSearch = udemSearch || {};

udemSearch.init = function(){
    this.currentResultPage = this.urlGetParameter('tx_solr[page]', 1);
    this.debug = this.urlGetParameter('debug', 0); // Permet d'afficher les params des pages boostées
    this.ajaxResultsUrl = $('#tx-solr-search').data('baseUrl') + 'recherche-resultats.html';
    this.ajaxFacetsUrl = $('#tx-solr-search').data('baseUrl') + 'recherche-facettes.json';
    this.pageBoosteeQueryString = $("#tx-solr-search").data('pageBoostee') || '';
    this.typeRecherche = $("#tx-solr-search").data('typeRecherche') || '';
    this.currentMode = 'modal';
    this.searchContextHasChanged = false; // Si l'utilisateur a modifié l'une des options de recherche
    this.searchedTerm = this.urlGetParameter('q', '');
    this.request1 = null;
    this.request2 = null;
    this.hideFacetPageBoosteeParam();
    this.loadFirstPageResults();
    this.appendModals();
    this.setModalOrCollapse();
    this.displaySelectedOptions();
    this.closePanelOnClickOutside();
}

/**************************
 * Barre avec les facettes
 **************************/
udemSearch.apply = function(that){
    this.syncForms(that);
    this.loadFirstPageResults();
    $(that).parents('.panel-content').collapse('hide');    // On ferme le panneau
}

udemSearch.applySearchByWords = function(that){
    let val = $('.facet-search-input',that).val();
    this.searchedTerm = val;
    $('.facet-search-input').val(val)
    this.loadFirstPageResults();
    this.displaySelectedOptions();
    $(that).parents('.panel-content').collapse('hide'); // On ferme le panneau
    $(that).parents('.modal').modal('hide'); // On ferme la modal
}

udemSearch.displaySelectedOptions = function(){
    $('#facets-options-selected div').remove(); // Remove all previously selected options

    if(this.searchedTerm) {
        $('#facets-options-selected').append('<div class="col-auto mt-2 mb-1 remove-option" id="remove-option-searched-term"><button class="btn remove-this-option" type="button" data-class="facet-search-input">'+ LocaleStrings.Search.SearchedTerm + udemSearch.htmlEncode(this.searchedTerm) + '<span>X</span></button></div>');
    }

    let options = this.getSelectedOptions();
    for (const option of options) {
        $('#facets-options-selected').append('<div class="col-auto mt-2 mb-1 remove-option gtm-' + option.class + '" id="remove-option-' + option.class + '"><button class="btn remove-this-option" type="button" data-class="' + option.class + '">' + option.label + '<span>X</span></button></div>');
    }

    if(options.length > 1 || (options.length == 1 && this.searchedTerm)){
        $('#facets-options-selected').append('<div class="col-auto mt-2 mb-1 remove-option"><button id="remove-all-options" class="btn" type="button">' + LocaleStrings.Search.removeAll + '<span>X</span></button></div>');
    }

    if(this.debug){
        let pageBoosteeOptions = this.getPageBoosteeOptions();
        for (const option of pageBoosteeOptions) {
            $('#facets-options-selected').append('<div class="col-auto mt-2 mb-1">' + option.class + ': ' + option.label + '</div>');
        }
    }
}

udemSearch.getSelectedOptions = function(){
    let options = [];
    var self = this;
    $("#tx-solr-search .options-build-url input:checked").not("#tx-solr-search .hidden-facet input:checked").each(function (index) {
        if (this.dataset.optionLabel) {
            let option = [];
            option.class = this.dataset.optionClass;
            option.label = self.getTitreLongIfExist(this.dataset.optionClass,this.dataset.optionLabel);
            options.push(option);
        }
    });
    return options;
}

udemSearch.getPageBoosteeOptions = function(){
    let options = [];
    var self = this;
    $("#tx-solr-search .hidden-facet input:checked").each(function (index) {
        if (this.dataset.optionLabel) {
            let option = [];
            option.class = this.dataset.optionClass;
            option.label = self.getTitreLongIfExist(this.dataset.optionClass,this.dataset.optionLabel);
            options.push(option);
        }
    });
    return options;
}

udemSearch.getTitreLongIfExist = function(optionClass,optionDefaultLabel){
    let titreLong = $('.facet-option-' + optionClass + ' span.titre-long').data('titreLong');
    return (titreLong) ? titreLong : optionDefaultLabel;
}

/* On masque la facette si le paramètre est dans l'URL de la page boostée */
udemSearch.hideFacetPageBoosteeParam = function(){
    var self = this;
    $("#tx-solr-search .facet-panel").each(function() {
        if(self.pageBoosteeQueryString.includes(($(this).data('facetName')))){
            $(this).addClass('hidden-facet');
        }
    });
}

udemSearch.hideFacetIfAllOptionsAreDisabled = function(){
    $("#tx-solr-search .facet-panel.hide-option-disabled").each(function() {
        (!$('.option',this).not('.disabled').length) ? $(this).addClass('facet-without-option') :  $(this).removeClass('facet-without-option');
    });
}

udemSearch.removeSearch = function(){
    this.searchedTerm = '';
    $('.facet-search-input').val('');
    this.urlRemoveParameter('q');
}

udemSearch.removeOption = function(that){
    if(that.dataset.class == 'facet-search-input'){
        this.removeSearch();
    }
    else{
        $('#tx-solr-search .' + that.dataset.class).prop('checked', false);
    }
    $(that).parent().remove();
    this.loadFirstPageResults();
}

udemSearch.removeAllOptions = function(){
    this.removeSearch();
    this.urlReplaceQueryString('');
    $('#tx-solr-search input:checkbox').not("#tx-solr-search .hidden-facet input:checked").prop('checked', false);
    $('#facets-options-selected div').remove();
    this.loadFirstPageResults();
}

udemSearch.resetFacet = function(that){
    $('input:checkbox', $(that).parents('.panel-content, .modal')).prop('checked', false);
    udemSearch.apply();
}

udemSearch.resetResearch = function(that){
    $('.'+that.dataset.target).val('');
    this.urlRemoveParameter('q');
    this.apply();
}

udemSearch.modifySearchContext = function(){
    this.searchContextHasChanged = true;
}

/*******************
 * Filtre : Admisison Ouvert ou Nom
 *******************/
udemSearch.isAdmissionEnCoursSelected = function(){
    return $('#admissionencours-1').prop('checked');
}

/***********************
 * Page de résultats: 1
 **********************/
udemSearch.loadFirstPageResults = function(){
    //this.setSearchParam();
    this.displaySelectedOptions();
    this.displayError('',false)
    $('#results-listing, #featured-results-listing').empty(); // Donne un meilleur effet visuellement lorsque fait ici et non dans replaceResults()
    this.toggleFeaturedTag();
    this.currentResultPage = 1; // global
    this.loadResults(false,false, false);
}

udemSearch.updateUrlForTrimestresModeOuvert = function(queryString){
    return (this.isAdmissionEnCoursSelected()) ? queryString.replaceAll("trimestre", "trimestresadmission") : queryString;
}

/* On pourrait toujours utiliser checkForFeaturedResults(), mais ça ne sert à rien pour le moment pour programmes et cours et serait peut-être plus lent.  */
udemSearch.replaceResults = function(data){
    this.updateOptionsCount(data.facets);
    this.hideFacetIfAllOptionsAreDisabled();

    if ($(data.htmlResults).hasClass('message-aucun-resultat') || $(data.htmlResults).hasClass('extbase-debugger')){
        $('#results-listing').html(data.htmlResults);
    }
    else if (data.queryType == 'article' || data.queryType == 'event'){
        this.checkForFeaturedResults(data.htmlResults,data.queryType,data.languageId);
        this.toggleFeaturedTag();
    }
    else{
        $('#results-listing').html(data.htmlResults);
    }
    this.sendViewItems(data.htmlResults);
    this.updateTotalCount(data);
    this.updateProgressBar(data);
    this.rechercheGeneraleSetAdvancedSearchLink(data.advancedSearchUrl,data.advancedSearchLabel);
    //this.rechercheGeneraleSetCategorieAffichee(data.queryTypeLabel);
}

udemSearch.checkForFeaturedResults = function(htmlResults,queryType,languageId){
    $('.resultat',$('<html />').html(htmlResults)).each(function(){
        if($(this).hasClass('featured')){
            $('#featured-results-listing').append(this);
        }
        else{
            if(queryType == 'event'){
                udemSearch.divideListingPerMonth(this,languageId);
            }
            else{
                $('#results-listing').append(this);
            }
        }
    });
}

udemSearch.updateTotalCount = function(data){

    if(parseInt(data.allResultCount)){
        $('.loaded-program-items').removeClass('d-none');
    }
    else{
        $('.loaded-program-items').addClass('d-none');
    }

    if(parseInt(data.allResultCount) > 1){
        $('.all-result-count-label').text(LocaleStrings.Search.results);
    }
    else{
        $('.all-result-count-label').text(LocaleStrings.Search.result);
    }

    $('.all-result-count').text(data.allResultCount);
    $('.loaded-result-count').text(data.loadedResultCount);

}

udemSearch.updateProgressBar = function(data){
    $('#progress-bar-percent').css('width',data.progressBarPercent + '%');
}

/* Pour les filtre de bases, il y a 1 système pour le mobile (modal) et 1 pour le desktop (panel/collapse). On veut garder les 2 systèmes synchronisés */
udemSearch.syncForms = function(){
    if(this.currentMode == 'collapse'){
        var resetClass = '.modal';
        var updateClass = '.collapse';
    }
    else{
        var resetClass = '.collapse';
        var updateClass = '.modal';
    }

    // Reset & Update the other form (1 form pour les modales sur mobiles et 1 pour les collapse sur desktop )
    $('#tx-solr-search '+ resetClass +' input:checkbox').prop('checked',false);
    $('#tx-solr-search '+ updateClass +' input:checkbox').each(function (index) {
        if (this.checked) {
            $('#tx-solr-search '+ resetClass +' .' + this.dataset.optionClass).prop('checked', true);
        }
    });
}

/**************************************
 * Page de résultats: 2 et +
 ***********************************/
udemSearch.loadMoreResults = function(){
    this.loadResults(true,true,true);
}

udemSearch.appendResults = function(data){
    (data.queryType == 'event') ? this.appendEvents(data.htmlResults,data.languageId) : $('#results-listing').append(data.htmlResults);
    this.sendViewItems(data.htmlResults);
    this.updateTotalCount(data);
    this.updateProgressBar(data);
    this.currentResultPage++;
}

udemSearch.appendEvents = function(htmlResults,languageId){
    $('.resultat',$('<html />').html(htmlResults)).each(function(){
        udemSearch.divideListingPerMonth(this,languageId);
    });
}

udemSearch.divideListingPerMonth = function(result,languageId){
    let moisAnnee = $(result).data('moisAnnee');
    let id = 'liste-evenements-'+ moisAnnee.replace(/\s+/g, '-').toLowerCase();
    if(moisAnnee && !$('#'+id).length){
        $('#results-listing').append('<h2 class="mois-annee">'+ moisAnnee +'</h2><ul id="'+ id +'" class="sous-liste-evenements" title="' + (languageId == 1 ? 'Events for ' : 'Événements pour ') + moisAnnee+ '"></ul>');
    }
    $('#'+id).append(result);
}

/*******************
 * Page de résultats: toutes
 *******************/
udemSearch.loadResults = function(loadingMore,addPageNumber,IncreasePageNumber){
    var self = this;
    this.updateLoadingStatus(true);
    this.toggleLoadMoreButton(false);
    this.urlReplaceQueryString(this.getQueryStringToDisplay(),loadingMore);

    let startpage = this.urlGetParameter('startpage', 0);    // Pour voir une page en particulier. Utile pour débugger.
    if(startpage){
        if(this.currentResultPage < startpage){
            this.currentResultPage = startpage;
        }
        addPageNumber = true;
    }

    let ajaxQueryString = this.updateUrlForTrimestresModeOuvert(this.getSolrQueryString(addPageNumber,IncreasePageNumber));

    // Cancel previous request
    if(this.request1 || this.request2){
        this.request1.abort();
        this.request2.abort();
    }

    // Pour la recherche générale / Globale
    // On récupère le nombre de résultats pour chaque type
    // Ce qui permet de savoir quel type afficher en premier
    if(this.searchedTerm && this.typeRecherche === 'generale' && !ajaxQueryString.includes('=type:') && this.currentResultPage == 1){
        //console.log('sendJsonRequest');
        this.requestJson(ajaxQueryString);
    }
    else{
        //console.log('sendBothRequest');
        this.sendBothRequest(ajaxQueryString,loadingMore);
    }
}

udemSearch.requestJson = function(ajaxQueryString){
    var self = this;
    // On doit faire une première requête pour obtenir le nombre de résultats pour chaque type
    this.request2 = this.ajaxGet(this.ajaxFacetsUrl + ajaxQueryString+'&get_first_type_with_result=1', '','json');
    $.when(this.request2).done(function(jsonInfo){
        // Si c'est la recherche générale initiale et qu'il y a des résultats
        // On veut trouver le premier type avec des résultats

        /*
        let firstTypeWithResults = '';
        if(jsonInfo.queryType == 'default' && jsonInfo.allResultCount){
            firstTypeWithResults = self.getFistTypeWithResults(jsonInfo.facets);
            if(firstTypeWithResults){
                udemSearch.rechercheGeneraleSetActiveTab( $("#tx-solr-search.generale #search-tabs li.facet-nav-type-"+firstTypeWithResults));
                // On ajoute le type dans le queryString
                ajaxQueryString += '&tx_solr[filter][0]=type:' + firstTypeWithResults;
            }
        }
         */

        // Le firstTypeWithResults est setté par PHP
        udemSearch.rechercheGeneraleSetActiveTab( $("#tx-solr-search.generale #search-tabs li.facet-nav-type-"+jsonInfo.queryType));
        // On ajoute le type dans le queryString
        ajaxQueryString += '&tx_solr[filter][0]=type:' + jsonInfo.queryType;


        // todo : on pourrait afficher un message si aucun résultat sans faire de requête additionnelle
        self.requestHtml(ajaxQueryString,jsonInfo);

    }).fail(function(xhr, ajaxOptions, thrownError) {
        if(thrownError != 'abort'){
            self.displayError(LocaleStrings.Search.error + ' <a href="#" id="retry-search">'+ LocaleStrings.Search.retry +'</a>',true);
            self.toggleLoadMoreButton(false);
            self.updateLoadingStatus(false);
        }
    });
}

udemSearch.requestHtml = function(ajaxQueryString,jsonInfo){
    var self = this;
    this.request1 =  this.ajaxGet(this.ajaxResultsUrl + ajaxQueryString, '', 'html');

    $.when(this.request1).done(function(htmlResults){
        let data = self.mergeResponses(htmlResults, jsonInfo);
        self.updateLoadingStatus(false);
        self.toggleLoadMoreButton(data.hasMoreResults);
        self.toggleHasMoreResults(data.hasMoreResults);
        self.replaceResults(data);
        window.dispatchEvent(new Event('exposant_tag'));
    }).fail(function(xhr, ajaxOptions, thrownError) {
        if(thrownError != 'abort'){
            self.displayError(LocaleStrings.Search.error + ' <a href="#" id="retry-search">'+ LocaleStrings.Search.retry +'</a>',true);
            self.toggleLoadMoreButton(false);
            self.updateLoadingStatus(false);
        }
    });
}

udemSearch.sendBothRequest = function(ajaxQueryString,loadingMore){
    var self = this;
    /* C'est plus rapide pour l'affichage de faire 2 requêtes simultanés, qu'une seule requête. */
    this.request1 =  this.ajaxGet(this.ajaxResultsUrl + ajaxQueryString, '', 'html');
    this.request2 =  this.ajaxGet(this.ajaxFacetsUrl + ajaxQueryString, '','json');

    $.when(this.request1,this.request2).done(function(htmlResults, jsonInfo){
        let data = self.mergeResponses(htmlResults[0], jsonInfo[0]);
        self.updateLoadingStatus(false);
        self.toggleLoadMoreButton(data.hasMoreResults);
        self.toggleHasMoreResults(data.hasMoreResults);
        (loadingMore) ? self.appendResults(data) : self.replaceResults(data);
        window.dispatchEvent(new Event('exposant_tag'));
    }).fail(function(xhr, ajaxOptions, thrownError) {
        if(thrownError != 'abort'){
            self.displayError(LocaleStrings.Search.error + ' <a href="#" id="retry-search">'+ LocaleStrings.Search.retry +'</a>',true);
            self.toggleLoadMoreButton(false);
            self.updateLoadingStatus(false);
        }
    });
}

udemSearch.getFistTypeWithResults = function(facets){
    for (let [key, option] of Object.entries(facets.type.options)) {
        if(option.documentCount != '0'){
            return option.value;
        }
    }
    return '';
}

udemSearch.mergeResponses = function(htmlResults,jsonInfo){
    let data = jsonInfo;
    data.htmlResults = htmlResults;
    return data;
}

// Update le nombre de résultats de chaque option de chaque facet
udemSearch.updateOptionsCount = function(facets){
    /* Lorsque la switch "Ouvert à l'admission" est activé, on remplace les nombres de "trimestre" par ceux de la facette "trimestresadmission"  */
    var trimestresAdmissionCount = {};
    if(this.isAdmissionEnCoursSelected()){
        trimestresAdmissionCount = this.getFacetTrimestresAdmissionCount(facets.trimestresadmission.options);
    }

    if(typeof facets === 'object'){
        for (let [facetName, facet] of Object.entries(facets)) {
            for (let [key, option] of Object.entries(facet.options)) {
                var count = 0;
                if(facetName === 'trimestre' && this.isAdmissionEnCoursSelected()){
                    (option.value in trimestresAdmissionCount) ? count = trimestresAdmissionCount[option.value] : count = 0;
                    // On désactive l'option si le compte est à 0
                    (count == 0) ? option.disabled = true : option.disabled = false;
                }
                else{
                    count = option.documentCount;
                }
                $('.' + option.class + ' .option-result-count').text('('+count+')');
                $('.' + option.class + ' input').attr('disabled', option.disabled);
                $('.' + option.class).toggleClass('disabled', option.disabled);
            }
        }
    }
}

udemSearch.getFacetTrimestresAdmissionCount = function(options){
    var facetCount = {};
    for (let [key, option] of Object.entries(options)) {
        facetCount[option.value] = option.documentCount;
    }
    return facetCount;
}

udemSearch.updateLoadingStatus = function(isLoading){
    $('#recherche-resultats').toggleClass('loading',isLoading);
}

udemSearch.toggleFeaturedTag  = function(){
    $('#featured-tag').toggle(($('#featured-results-listing .resultat').length > 0));
}

udemSearch.toggleLoadMoreButton = function(showButton){
    $('#btn-charger-plus').toggle(showButton);
}

udemSearch.toggleHasMoreResults = function(hasMoreResults){
    $('#recherche-resultats').toggleClass('has-more-results',hasMoreResults);
}

udemSearch.displayError = function(msg,toggle){
    $('#results-listing-bottom .message-erreur').html(msg).toggle(toggle);
}

/*******************
 * Solr  QueryString
 *******************/
udemSearch.addToQueryString = function(param,separator){
    let value =  this.urlGetParameter(param,'');
    return (value) ? separator + param+'=' + value : '';
}

udemSearch.checkedOptionToQueryString = function(){
    var self = this;
    var queryString = '';
    var nbFilters = 0;
    $("#tx-solr-search .options-build-url input:checked").each(function (index) {
        queryString += self.getSeperator(nbFilters) + 'tx_solr[filter][' + nbFilters + ']=' + this.value;
        nbFilters++;
    });
    return queryString;
}

udemSearch.getQueryStringToDisplay = function(){
    var self = this;
    var queryString = '';
    var nbTotalFilter = (this.pageBoosteeQueryString.match(/tx_solr/g) || []).length;
    var nbAdditionnalFilters = 0;
    $("#tx-solr-search .options-build-url input:checked").each(function (index) {
        if(!self.pageBoosteeQueryString.includes(this.value)){
            queryString += self.getSeperator(nbAdditionnalFilters) + 'tx_solr[filter][' + nbTotalFilter + ']=' + this.value;
            nbAdditionnalFilters++;
            nbTotalFilter++;
        }
    });
    queryString += (this.searchedTerm) ? this.getSeperator(queryString) + 'q=' +  this.searchedTerm : '';
    return queryString;
}

udemSearch.getSolrQueryString = function(addPageNumber, increasePageNumber){
    var queryString = this.checkedOptionToQueryString();
    queryString += (this.searchedTerm) ? this.getSeperator(queryString) + 'q=' +  this.searchedTerm : '';
    queryString += (addPageNumber) ? this.getSeperator(queryString) + 'tx_solr[page]=' + this.getNextRequestPageNumber(increasePageNumber) : '';
    return queryString;
}

udemSearch.getSeperator = function(queryString){
    return (queryString) ?  '&' : '?';
}

udemSearch.getNextRequestPageNumber = function(increasePageNumber){
    return (increasePageNumber) ? (parseInt(this.currentResultPage) + 1) : this.currentResultPage;
}

/*******************
 * Modal & Collapse : modal on mobile & Collapse on desktop
 *******************/
udemSearch.closePanelOnClickOutside = function(){
    $(document).mouseup(function (e) {
        var container = $("#recherche-facettes-wrap .panel-content");
        // if the target of the click isn't the container nor a descendant of the container
        if (!container.is(e.target) && container.has(e.target).length === 0 && typeof eval('container.collapse') === 'function') {
            container.collapse('hide');
        }
    });
}

udemSearch.setFocusOnSearchInput = function(){
    if(this.currentMode == 'collapse'){
        $('.recherche-par-mot .panel-content .facet-search-input').focus();
    }
    else{
        $('.modal-search-facet.recherche-par-mot .facet-search-input').focus();
    }
}


udemSearch.setModalOrCollapse = function(){
    var self = this;
    $("#recherche-facettes-wrap .facet-panel .toggle-btn").each(function() {
        (window.innerWidth > 800) ? self.currentMode = 'collapse' : self.currentMode = 'modal';
        $(this).attr('data-bs-toggle', self.currentMode)
        $(this).attr('data-bs-target', $(this).attr('data-target-' + self.currentMode))
    });
}

/***************
 * Helper functions
 ***************/
udemSearch.htmlEncode = function(str){
    return String(str).replace(/[^\w. ]/gi, function(c){
        return '&#'+c.charCodeAt(0)+';';
    });
}

udemSearch.ajaxGet = function(url, data, dataType){
    return $.ajax({
        type: 'GET',
        url: url,
        dataType: dataType,
        data: data,
        async: true,
        success: function (response) {
            return response;
        },
        error: function (xhr, ajaxOptions, thrownError) {
            return false;
        },
        timeout: 30000 // millisecondes (30 secondes)
    });
}

udemSearch.urlGetParameter = function(param, defautValue){
    let url = new URL(window.location.href);
    let value = url.searchParams.get(param);
    return (value) ? value.replace(/</g, "&lt;").replace(/>/g, "&gt;") : defautValue;
}

udemSearch.urlHasParam = function(param){
    let url = new URL(window.location.href);
    return url.searchParams.has(param);
}

udemSearch.urlReplaceQueryString = function(queryString,loadingMore){
    /* On ne veut pas changer l'URL lors de chargement supplémentaire et à l'ouverture de la page lorsque l'utilisateur n'a encore rien fait */
    if(!loadingMore && this.searchContextHasChanged){
        window.history.pushState('', '', window.location.href.split('?')[0] + queryString);
    }
}

udemSearch.urlRemoveParameter = function(param){
    let url = new URL(window.location.href);
    url.searchParams.delete(param);
    window.history.pushState('', '', url);
}

udemSearch.urlUpdate = function(param,value){
    let url = new URL(window.location.href);
    url.searchParams.set(param, value);
    window.history.pushState('', '', url);
}

/* Créer une version modale pour chaque panneau des options de base de la recherche */
udemSearch.appendModals = function(){
    $('.facet-panel.duplicate-modal').each(function(){
        let facetName = $(this).data('facetName');
        let facetLabel = $(this).data('facetLabel');
        let facetClass = $(this).data('facetClass');
        let showButton = $(this).data('modalShowButton');
        let content = $('.duplicate-modal-content',this).html();

        const modalTemplate = `    
            <div class="modal modal-search-facet ${facetClass}" id="modal-${facetName}" tabindex="-1" aria-labelledby="modal-{facetName}-label" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h4 class="modal-title" id="modal-${facetName}-label">${facetLabel}</h4>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">                         
                                ${content}                        
                        </div>
                        <div class="modal-footer">
                            ${showButton ? `<div class="facet-buttons"><button type="button" class="btn btn-primary" data-bs-dismiss="modal">${LocaleStrings.Search.show}</button></div>` : ''}
                        </div>
                    </div>
                </div>
            </div>
        `;

        $('#tx-solr-search').append(modalTemplate)

        /* Fix les id et les "for" pour éviter d'avoir des doublons */
        $('#modal-'+facetName + ' .option input').each(function() {
            this.id = this.id + '-modal';
            $(this).next('label').attr('for',this.id);
        });
    });
}

udemSearch.rechercheGeneraleSetActiveTab = function(that){
    $('#search-tabs li').removeClass('active');
    $('#search-tabs input:checkbox').prop("checked", false);
    $(that).toggleClass('active');
    $('input:checkbox',that).prop("checked", true);
}

udemSearch.rechercheGeneraleInitTab = function(){
    udemSearch.rechercheGeneraleSetSearchedValue();
}

udemSearch.rechercheGeneraleSetSearchedValue = function(){
    let q = this.urlGetParameter('q', '');
    if(q){
        $('#recherche-generale-header-input').val(q)
    }
}
udemSearch.rechercheGeneraleSetAdvancedSearchLink = function(url,label){
    if(url && label){
        let htmlTag = '<div class="link-wrap"><a href="'+url+'">'+label+'</a></div>';
        $('#advanced-search-link').html(htmlTag);
    }
    else{
        $('#advanced-search-link').html('');
    }
}

udemSearch.rechercheGeneraleSetCategorieAffichee = function(categorie){
    if(categorie){
        $('#categorie-affichee').text('Catégorie : ' + categorie);
    }
    else{
        $('#categorie-affichee').html('');
    }
}

/***************
 * GTM - Analytics
 ***************/

udemSearch.sendViewItems = function (html) {

    const cleanText = (text) => {
        return text?text.replace(/(<([^>]+)>)/gi, '').replace(/^\s+|\s+$/g, '') : text;
    }

    const convertCycleNumToText = (cycleNum) => {
        switch(cycleNum) {
            case '1' :
                return '1er cycle';
            case '2' :
                return '2e cycle';
            case '3' :
                return '3e cycle';
            case '4' :
            case '5' :
            case '6' :
            default :
                return 'Autre'
        }
    }

    const getDomaine = (els) => {
        return Array.from(els).reduce((acc, curr) => {
            return cleanText(curr.dataset.domaine) + ', ' + acc;
        }, '').slice(0,-2);
    }

    const tempContainer = document.createElement('div');
    tempContainer.innerHTML = html.trim();

    //si on a un seul trimestre dans les options de recherche, on l'ajoute au item_variant
    const searchOptions = document.querySelector('.gtm-search-options');
    const trimestres = searchOptions?searchOptions.querySelectorAll('div[class*="gtm-trimestre"]'):undefined;
    const trimestreVariant = trimestres && trimestres.length === 1 ? " - " + cleanText(trimestres[0].textContent).slice(0,-1): "";

    const programs = tempContainer.querySelectorAll('.gtm-programme-item');

    const gtm_items = Array.from(programs).map((item) => {

        const numero  = cleanText(item.dataset.gtmProgrammeNumero ?? "").replace(/-/gi, '');
        const titre   = cleanText(item.dataset.gtmProgrammeTitre ?? "");
        const niveau  = cleanText(item.dataset.gtmProgrammeNiveau ?? "");
        const cycle   = convertCycleNumToText(cleanText(item.dataset.gtmProgrammeCycle ?? ""));
        const baccapcodes = cleanText(item.dataset.gtmProgrammeBaccapcodes ?? "");
        const offersBaccap = (baccapcodes.length) ? 1 : 0;
        const domaine = (() => {
            const domaines = cleanText(item.dataset.gtmProgrammeDomaine ?? "")
                .split(",")
                .map(value => value.trim())
                .filter(value => value !== "");

            // Trier les domaines par ordre alphabétique s'il y en a plus d'un.
            return domaines.length > 1 ? domaines.sort().join(", ") : domaines[0] ?? "";
        })();
        const faculte = (() => {
            const rawFaculte = cleanText(item.dataset.gtmProgrammeFaculte ?? "");
            return rawFaculte.length === 1 ? `0${rawFaculte}` : rawFaculte;
        })();
        const trimestre = (() => {
            const trimestreValues = cleanText(item.dataset.gtmProgrammeTrimestre ?? "")
                .split(",") // Diviser les valeurs séparées par des virgules en un array.
                .map(value => value.trim()) // Enlever des espaces avant et après
                .filter(value => value !== ""); // Enlever des valeurs vides

            // Triez les valeurs numériquement et on prend que la première + on retourne en numérique.
            return trimestreValues.length > 0 ? parseInt(trimestreValues.sort((a, b) => a - b)[0], 10) : "";
        })();

        const name = numero + " - " + titre + " - " + niveau;

        return {
            price         : 0,
            currency      : 'CAD',
            quantity      : 1,
            item_id       : numero,
            item_name     : name,
            item_category : cycle,
            item_category2: niveau,
            item_category3: domaine,
            item_category4: faculte,
            item_category5: null,
            item_category6: offersBaccap,
            item_variant  : trimestre
        };
    })

    const event = {
        event : 'view_item_list',
        ecommerce : {
            value : 0,
            currency : 'CAD',
            items : gtm_items
        }
    };

    if (event.ecommerce.items.length > 0) {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push(event);
        //console.log('gtm', event);
    }
}

/***************
 * Events
 ***************/
$('#tx-solr-search').on('click','input:checkbox', function () {
    udemSearch.modifySearchContext();
    udemSearch.apply();
});

$('#tx-solr-search.generale #search-tabs').on('click','li', function () {
    udemSearch.modifySearchContext();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    udemSearch.rechercheGeneraleSetActiveTab(this);
    udemSearch.apply();
});

$('#tx-solr-search').on('click','#trimestres-admission-switch', function () {
    udemSearch.modifySearchContext();
    udemSearch.loadFirstPageResults();
});

$('#tx-solr-search').on('click','button.remove-this-option', function () {
    udemSearch.modifySearchContext();
    udemSearch.removeOption(this);
});

$('#tx-solr-search').on('click','button#remove-all-options', function () {
    udemSearch.modifySearchContext();
    udemSearch.removeAllOptions(this);
});

$('#tx-solr-search').on('click','#btn-charger-plus', function () {
    udemSearch.loadMoreResults();
});

$('#tx-solr-search').on('click','#retry-search', function (event) {
    event.preventDefault();
    udemSearch.displayError('',false)
    udemSearch.loadMoreResults();
});

$('#tx-solr-search').on('click','#facet-search-input-icon-wrap', function () {
    udemSearch.setFocusOnSearchInput();
});

$('#tx-solr-search').on('submit','.facet-search-input-form', function (event) {
    event.preventDefault();
    udemSearch.modifySearchContext();
    udemSearch.applySearchByWords(this);
});

$(window).resize(function() {
    udemSearch.setModalOrCollapse();
});

if ($('#tx-solr-search').length > 0 ){ udemSearch.init(); }
if ($('#tx-solr-search.generale').length > 0 ){ udemSearch.rechercheGeneraleInitTab(); }
