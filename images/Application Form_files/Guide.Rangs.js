var Guide = (function(Guide, $, window, document, undefined) {

    Guide.Rangs = {
        init: function() {

        	this.form = $('#rechercheRang');
        	this.loader = $('#loader');
        	this.results = $('#results');
        	this.searchTrigger = this.form.find('#searchButton');
        	this.desistTrigger = this.form.find('#desistButton');

			this.cheminViewAjax = cheminViewAjax.replace(/amp;/g, '');
        	this.csv = csv;
			this.pluginType = typePlugin;
			this.programme = programme;
        	this.messages = {
        		confirm: [
        			'Je confirme que je souhaite libérer ma place sur la liste d’attente et me désister de ce programme d’études',
        			'I confirm that I want to give my place on the waiting list and quit this program.'
        		],

        		confirm_mus: [
        			'Je confirme que j’accepte le choix subséquent proposé.',
        			'I confirm that I accept the subsequent choice proposed.'
        		],

        		decline_mus: [
        			'Je confirme que je refuse le choix subséquent proposé.',
        			'I confirm that I decline the subsequent choice proposed.'
        		],

        		error: [
        			'Désolé, une erreur s\'est produite.',
        			'Sorry, an error occured.'
        		],
				aucun_matricule: [
					'Aucun matricule associé à ce compte. Assurez-vous de vous connecter avec un compte "umontreal".',
					'No UdeM number (matricule) associated with this account. Make sure to log in with a "umontreal" account.'
				],
        		error_messages_checks:[
        			'Vous devez cocher la case associée au programme d’études pour lequel vous souhaitez vous désister',
        			'You must choose at least one program.'
        		],

        		no_results: [
        			'Aucune information trouvée à votre dossier étudiant pour le moment.',
        			'There are no informations for this matricule at the moment'
        		]

        	}

			this.fetchData();

        },

        fetchData: function(){
			var matricule = $('input#matricule').val();
			// Récupérer les données dans le fichier CSV
			$.ajax({
                url: this.cheminViewAjax,
                data: {
                    "tx_lboudemrangattente_connaitrerang[type]": this.pluginType,
                    "tx_lboudemrangattente_connaitrerang[programme]": this.programme
                    },
                success: $.proxy(function(data) {
                    // Cacher le loader
                    this.loader.hide();
                    if(data.hasOwnProperty("error")){
                        this.results.empty();
                        this.results.append('<p>' +  this.messages[data.error][Guide.Settings.langCode]  + '</p>');
                    }
                    else{
                        this.showData(data);
                    }
                }, this),
                error: $.proxy(function(XMLHttpRequest, textStatus, errorThrown) {
                    this.loader.hide();
                    this.results.empty();
                    this.results.append('<p>' + this.messages.error[Guide.Settings.langCode] + '</p>');
                }, this),
                timeout: 5000 // Peut prendre jusqu'à 2200ms en mode throttle "Regular 3G"
			});
		},

        showData: function(data) {
			this.results.empty();
			// Vérifier si la recherche est vide
			if (data.length == 0) {
				this.results.append('<div class="ce-bodytext"><p>' + this.messages.no_results[Guide.Settings.langCode] + '</p></div>');
			}

			// Sinon on affiche les données
			else {
				var resultTable;
				var stringAppend = '';
				var checkboxes;
				var popupTrigger;
				var submitter;
				var canceller;
				var displayCoteR = false;

				this.results.append('<table class="table rankTable"><tbody></tbody></table>');

				resultTable = this.results.find('table')
				stringAppend = '<tr>';

				if(this.pluginType == 1) {
					for (var i = 0; i < data.length; i++) {
						if(data[i][5] !== 'n/d') {
							displayCoteR = true;
						}
					}
					stringAppend += '<th>' + LocaleStrings.Ranks.program_label + '</th>';
					stringAppend += '<th>' + LocaleStrings.Ranks.rank + '</th>'
					stringAppend += '<th>' + LocaleStrings.Ranks.category + '</th>';

					if(displayCoteR) {
						stringAppend += '<th>' + LocaleStrings.Ranks.cote_r + '</th></tr>';
					}
				} else if(this.pluginType == 2) {
					stringAppend += '<th class="firstchild"></th>';
					stringAppend += '<th>' + LocaleStrings.Ranks.program_no_label + '</th>';
					stringAppend += '<th>' + LocaleStrings.Ranks.rank_list + '</th>';
					stringAppend += '<th>' + LocaleStrings.Ranks.last_admit_rank + '</th>';
					stringAppend += '<th>' + LocaleStrings.Ranks.category + '</th></tr>';
				} else if(this.pluginType == 3) {
					stringAppend += '<th class="firstchild"></th>';
					stringAppend += '<th>' + LocaleStrings.Ranks.initial_program + '</th>';
					stringAppend += '<th>' + LocaleStrings.Ranks.choice + '</th>';
					stringAppend += '<th></th></tr>';
					/* Le comparateur ne sera pas disponible dans la V1 de Reca */
					//stringAppend += '<th>' + LocaleStrings.Ranks.action + '</th></tr>';
				}
				else if(this.pluginType == 4) {
					stringAppend += '<th class="firstchild"></th>';
					stringAppend += '<th>' + LocaleStrings.Ranks.choice + '</th></tr>';
				}

				for (var i=0; i < data.length; i++) {
					stringAppend += '<tr>';

					if(this.pluginType == 1) {

						stringAppend += '<td>' + data[i][3] + '</td>';
						stringAppend += '<td>' + data[i][1] + '&nbsp;sur&nbsp;' + data[i][2] + '</td>';
						stringAppend += '<td>' + data[i][4] + '</td>';
						if(displayCoteR) {
							stringAppend += '<td>' + data[i][5] + '</td>';
						}

					} else if(this.pluginType == 2) {

						// S'il n'y a pas eu de désistement, on ajoute le checkbox
						stringAppend += '<td>';
						if (!data[i][8]) {
							stringAppend += '<input type="checkbox" name="tx_lboudemrangattente_connaitrerang[choice][]" value="' + data[i][7] + '">';
						}
						stringAppend += '</td>';

						// programme
						stringAppend += '<td>' + data[i][3] + ' - ' +  data[i][4] + '</td>';
						// Votre rang
						stringAppend += '<td>' + data[i][1] + '&nbsp;sur&nbsp;' + data[i][2] + '<br /><span class="date-du-choix">' + data[i][8] + '</span></td>';
						// rang du dernier admis
						stringAppend += '<td>' + data[i][6] + '</td>';
						// categorie
						stringAppend += '<td>' + data[i][5] + '</td>';

					}
					else if(this.pluginType == 3) {

						// S'il n'y a pas eu de désistement, on ajoute le checkbox
						stringAppend += '<td>';
						if (!data[i][6]) {
							stringAppend += '<input type="checkbox" name="tx_lboudemrangattente_connaitrerang[choice][]" value="' + data[i][5] + '">';
						}
						stringAppend += '</td>';

                        stringAppend += '<td>';
						if (data[i]['initial'].length == 0) {
                            stringAppend += data[i][1];
						} else {
                            stringAppend += '<a href="' + data[i]['initial']['uri'] + '" target="_blank">' + data[i]['initial']['title'] + '</a>';
						}
                        stringAppend += '</td>';

						stringAppend += '<td>';

                        if (data[i]['proposal'].length == 0) {
                            stringAppend += data[i][2] + '<span class="date-du-choix">' + data[i][6] + '</span>';
                        } else {
                            stringAppend += '<a href="' + data[i]['proposal']['uri'] + '" target="_blank">' + data[i]['proposal']['title'] + '</a><br /><span class="date-du-choix">' + data[i][6] + '</span>';
                        }
                        stringAppend += '</td>';

                        stringAppend += '<td>';

						/* Le comparateur ne sera pas disponible dans la V1 de Reca */
                        //if (data[i]['compare'] != '') {
                        //    stringAppend += '<button class="btn js-compareTrigger" data-action="' + data[i]['compare'] + '">' + LocaleStrings.Ranks.compare + '</button>';
                       // }

                        stringAppend += '</td>';

                    }
					else if (this.pluginType == 4) {

						// S'il n'y a pas eu de désistement, on ajoute le checkbox
						stringAppend += '<td>';
						if (!data[i][6]) {
							stringAppend += '<input type="checkbox" name="tx_lboudemrangattente_connaitrerang[choice][]" value="' + data[i][5] + '">';
						}
						stringAppend += '</td>';

						stringAppend += '<td>';
                        if (data[i]['proposal'].length == 0) {
                            stringAppend += data[i][2] + '<span class="date-du-choix">' + data[i][6] + '</span>';
                        } else {
                            stringAppend += '<a href="' + data[i]['proposal']['uri'] + '" target="_blank">' + data[i]['proposal']['title'] + '</a><br /><span class="date-du-choix">' + data[i][6] + '</span>';
                        }
                        stringAppend += '</td>';

					}

                    stringAppend += '</tr>';

                }

				resultTable.append(stringAppend);
				checkboxes = this.form.find('input[type="checkbox"]');

				/* Connaître votre rang sur la liste d'attente */
				if(this.pluginType == 2) {

					this.results.append('<p>Pour retirer votre candidature de la liste d’attente, sélectionnez le ou les programmes concernés ci-dessus et cliquez sur le bouton suivant :</p>');

					// Affichage du bouton de confirmation désactivé
					this.results.append('<button class="btn btn-bleu btn-fit-content js-popupTrigger" name="desistement" id="desistButton" disabled>Je veux me désister</button>');

					popupTrigger = $('.js-popupTrigger');
					popupTrigger.click($.proxy(function(e){
						$("#modal-confirmation .modal-body").html(this.messages.confirm[Guide.Settings.langCode]);
					}, this))
				}
				/* Choix subséquents */
				if(this.pluginType == 3 || this.pluginType == 4) {
					var popupContent;

					// Ajout des boutons désactivé, car aucune case n'est cochée initialement
                    this.results.append('<button class="btn btn-fit-content js-popupTrigger btn-bleu" id="accepteButton" disabled>' + LocaleStrings.Ranks.confirm_yes + '</button>');
					this.results.append('<button class="btn btn-fit-content js-popupTrigger btn-blanc" id="refuseButton" disabled>' + LocaleStrings.Ranks.confirm_no + '</button>');

					// Ajout d'un champ caché pour indiquer le bouton cliqué
					this.results.append('<input type="hidden" class="is-accepted" name="tx_lboudemrangattente_connaitrerang[accepte]" />');

					popupTrigger = $('.js-popupTrigger');
					popupTrigger.click($.proxy(function(e){
						var btnId = e.target.id;
						var value;

						// Changement du message de la modale selon la décision prise
						if( btnId === 'accepteButton') {
							value = 1;
							$("#modal-confirmation .modal-body").html(this.messages.confirm_mus[Guide.Settings.langCode]);

						} else {
							value = 0;
							$("#modal-confirmation .modal-body").html(this.messages.decline_mus[Guide.Settings.langCode]);
						}

						$('.is-accepted').attr('value', value);

					}, this));

                    $('.js-compareTrigger').click(function(event){

                        event.preventDefault();
                        event.stopPropagation();
                        url = $(this).data('action');
                        if (url != '') {
                            window.open(url);
						}
                    });
                }

				const modalTemplate = `    
						<div class="modal" id="modal-confirmation" tabindex="-1" aria-labelledby="modal-confirmation-label" aria-hidden="true">
							<div class="modal-dialog modal-dialog-centered">
								<div class="modal-content">
									<div class="modal-header">
										<h4 class="modal-title" id="modal-confirmation-label">Confirmation</h4>
										<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
									</div>
									<div class="modal-body"></div>
									<div class="modal-footer">						
										<button class="btn btn-primary js-submitButton" type="button" data-bs-dismiss="modal" onclick="this.form.submit();">Ok</button>
										<button class="btn btn-secondary js-cancelButton" type="button" data-bs-dismiss="modal">${LocaleStrings.common.cancel}</button>											
									</div>
								</div>
							</div>
						</div>`;

				this.results.append(modalTemplate);


				// Vérification du nombre de boîtes à cocher qui sont actives
				checkboxes.change($.proxy(function(){
					if(this.form.find(':checked').length > 0){
						popupTrigger.removeAttr('disabled')
					} else {
						popupTrigger.attr('disabled', 'disabled');
					}
				}, this));

				this.createPopup(popupTrigger);
			}
		},

		createPopup: function(popupTrigger){
			var self = this;
			popupTrigger.on('click', $.proxy(function(e) {
				e.preventDefault();
				let modalConfirm = new bootstrap.Modal(document.getElementById('modal-confirmation'));
				modalConfirm.show()
	        }, self));
		}
	};

	return Guide;

})(Guide || {}, jQuery, window, document);
