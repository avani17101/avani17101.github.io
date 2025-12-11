/**************************
 Langues - RECA
**************************/

(function( $, window, document, undefined ) {

    /* On affiche le lien vers l'accueil seulement si aucun autre lien est affiché*/
    $("#modal-language-selector .language-wrap").each(function() {
        if ($('.link-translated-page',this).length == 0 && $('.link-translated-section',this).length == 0 ){
            $('.link-translated-home',this).show();
        }
    });

    /* On affiche le message de "traduction non disponible" si lien vers la traduction de la page n'est pas là */
    $("#modal-language-selector .language-wrap").not(".active").each(function() {
        if ($('.link-translated-page',this).length == 0){
            $('.translation-not-available',this).show();
        }
    });

})( jQuery, window, document );