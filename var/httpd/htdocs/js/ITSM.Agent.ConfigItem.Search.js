// --
// ITSM.Agent.ConfigItem.Search.js - provides the special module functions for the global search
// Copyright (C) 2001-2010 OTRS AG, http://otrs.org/\n";
// --
// $Id: ITSM.Agent.ConfigItem.Search.js,v 1.3 2010-09-15 17:35:50 cr Exp $
// $OldId: Core.Agent.Search.js,v 1.22 2010/09/10 14:44:35 mg Exp $
// --
// This software comes with ABSOLUTELY NO WARRANTY. For details, see
// the enclosed file COPYING for license information (AGPL). If you
// did not receive this file, see http://www.gnu.org/licenses/agpl.txt.
// --

"use strict";

// ---
// ITSM
// ---
//var Core = Core || {};
//Core.Agent = Core.Agent || {};
var ITSM = ITSM || {};
ITSM.Agent = ITSM.Agent || {};
ITSM.Agent.ConfigItem = ITSM.Agent.ConfigItem || {};
// ---

/**
 * @namespace
// ---
// ITSM
// ---
// * @exports TargetNS as Core.Agent.Search
 * @exports TargetNS as ITSM.Agent.ConfigItem.Search
// ---
 * @description
 *      This namespace contains the special module functions for the search.
 */
// ---
// ITSM
// ---
//Core.Agent.Search = (function (TargetNS) {
ITSM.Agent.ConfigItem.Search = (function (TargetNS) {

//    /**
//     * @function
//     * @return nothing
//     *      This function rebuild attribute selection, only show available attributes
//     */

//    TargetNS.RebuildSelection = function () {

//        // get original selection
//        var $AttributeClone = $('#AttributeOrig').clone();
//        $AttributeClone.attr('id', 'Attribute');

//        // strip all already used attributes
//        $AttributeClone.find('option').each(function () {
//            var $Attribute = $(this);
//            $('#SearchInsert label').each(function () {
//                if ($(this).attr('for') === $Attribute.attr('value')) {
//                    $Attribute.remove();
//                }
//            });
//        });

//        // replace selection with original selection
//        $('#Attribute').replaceWith($AttributeClone);

//        return true;
//    };
// ---

    /**
     * @function
     * @return nothing
     *      This function add attributes for search
     */

    TargetNS.ItemAdd = function (Attribute) {
        $('#SearchAttributesHidden').find('label').each(function () {
            if ($(this).attr('for') === Attribute) {
                $(this).prev().clone().appendTo('#SearchInsert');
                $(this).clone().appendTo('#SearchInsert');
                $(this).next().clone().appendTo('#SearchInsert')
                    // bind click function to remove button now
                    .find('.Remove').bind('click', function () {
                        var $Element = $(this).parent();
// ---
// ITSM
// ---
//                        TargetNS.ItemRemove($Element);
                        Core.Agent.Search.ItemRemove($Element);
// ---
                        // rebuild selection
// ---
// ITSM
// ---
//                        TargetNS.RebuildSelection();
                        Core.Agent.Search.RebuildSelection();
// ---

                        return false;
                    });
            }
        });

// ---
// ITSM
// ---
        // set autocomple to customer type fields
        $('#SearchInsert').find('.ITSMCustomerSearch').each(function() {
            var InputId = $(this).attr('id') + 'Autocomplete';
            $(this).removeClass('ITSMCustomerSearch');
            $(this).attr('id', InputId);
            $(this).prev().attr('id', InputId + 'Selected');

            ITSM.Agent.ConfigItem.CustomerSearch.Init($('#' + InputId), Core.Config.Get('Autocomplete.Active'));

            // prevent dialog closure when select a customer from the list
            $('ul.ui-autocomplete').bind('click', function(Event) { Event.stopPropagation(); return false; });
        });
        return false;
    };
// ---

// ---
// ITSM
// ---
//    /**
//     * @function
//     * @param {jQueryObject} $Element The jQuery object of the form  or any element within this form
//     * @return nothing
//     *      This function remove attributes from an element
//     */

//    TargetNS.ItemRemove = function ($Element) {
//        $Element.prev().prev().remove();
//        $Element.prev().remove();
//        $Element.remove();
//    };
// ---

    // delete profile

    /**
     * @function
     * @private
     * @param {Profile} Profile The profile that will be delete
     * @return nothing
     * @description Delete a profile via an ajax requests
     */
    function DeleteRemote(Profile) {
        var Data = {
// ---
// ITSM
// ---
//            Action: 'AgentTicketSearch',
            Action: 'AgentITSMConfigItemSearch',
// ---
            Subaction: 'AJAXProfileDelete',
            Profile: Profile,
// ---
// ITSM
// ---
            ClassID: $('#SearchClassID').val()
// ---
        };
        Core.AJAX.FunctionCall(
            Core.Config.Get('CGIHandle'),
            Data,
            function () {}
        );
    }

    function ShowWaitingDialog(){
        Core.UI.Dialog.ShowContentDialog('<div class="Spacing Center"><span class="AJAXLoader" title="' + Core.Config.Get('LoadingMsg') + '"></span></div>', '', '10px', 'Center', true);
    }

// ---
// ITSM
// ---
    /**
     * @function
     * @param {Profile} The profile that is set to the search dialog
     * @return nothing
     *      This function refresh the search dialog with the selected profile
     */

    TargetNS.LoadProfile = function (Profile) {
        var BaseLink = Core.Config.Get('Baselink') ;
            Action = 'Action=AgentITSMConfigItemSearch;' ;
            SubAction = 'Subaction=AJAXUpdate;' ;
            ClassID = 'ClassID=' + $('#SearchClassID').val() + ';';
            SearchProfile = 'Profile=' + Profile;
            URL =  BaseLink + Action + SubAction + ClassID + SearchProfile ;
        $('.InnerContent').addClass('Loading');
        Core.AJAX.ContentUpdate($('#AJAXUpdate'), URL, function(){
            TargetNS.SetSearchDialog( '$Env{"Action"}' );
            $('#ITSMSearchProfile').removeClass('Hidden');
            $('#ITSMSearchFields').removeClass('Hidden');
            $('#SearchFormSubmit').removeClass('Hidden');
            $('.InnerContent').removeClass('Loading');
        });
    };

    /**
     * @function
     * @param none
     * @return nothing
     *      This function sets all search dialog settings
     */

    TargetNS.SetSearchDialog = function() {
        // hide add template block
        $('#SearchProfileAddBlock').hide();

        if ($('#Profile').val() && $('#Profile').val() !== 'last-search') {
            $('#SearchProfileDelete').show();
        }

        // register add of attribute
        $('.Add').live('click', function () {
            var Attribute = $('#Attribute').val();
            TargetNS.ItemAdd(Attribute);
            Core.Agent.Search.RebuildSelection();
            return false;
        });

        // register return key
        $('#SearchForm').unbind('keypress.FilterInput').bind('keypress.FilterInput', function (Event) {
            if ((Event.charCode || Event.keyCode) === 13) {
                $('#SearchForm').submit();
                return false;
            }
        });

        // register submit
        $('#SearchFormSubmit').bind('click', function () {
            // Normal results mode will return HTML in the same window
            if ($('#SearchForm #ResultForm').val() === 'Normal') {
                $('#SearchForm').submit();
                ShowWaitingDialog();
            }
            else { // Print and CSV should open in a new window, no waiting dialog
                $('#SearchForm').attr('target', 'SearchResultPage');
                $('#SearchForm').submit();
                $('#SearchForm').attr('target', '');
            }
            return false;
        });


        // load profile
        $('#Profile').bind('change', function () {
            var Profile = $('#Profile').val();
            TargetNS.LoadProfile(Profile);
            return false;
        });

        // show add profile block or not
        $('#SearchProfileNew').bind('click', function (Event) {
            $('#SearchProfileAddBlock').toggle();
            Event.preventDefault();
            return false;
        });

        // add new profile
        $('#SearchProfileAddAction').bind('click', function () {
            var Name, $Element1, $Element2;

            // get name
            Name = $('#SearchProfileAddName').val();
            if (!Name) {
                return false;
            }

            // add name to profile selection
            $Element1 = $('#ProfileList').children().first().clone();
            $Element1.text(Name);
            $('#ProfileList').append($Element1);
            $Element2 = $('#Profile').children().first().clone();
            $Element2.text(Name);
            $Element2.attr('value', Name);
            $Element2.attr('selected', 'selected');
            $('#Profile').append($Element2);

            // set input box to empty
            $('#SearchProfileAddName').val('');

            // hide add template block
            $('#SearchProfileAddBlock').hide();

            $('#SearchProfileDelete').show();

            return false;
        });

        // delete profile
        $('#SearchProfileDelete').bind('click', function (Event) {

            // strip all already used attributes
            $('#Profile').find('option:selected').each(function () {
                if ($(this).attr('value') !== 'last-search') {

                    // rebuild attributes
                    $('#SearchInsert').text('');

                    // remove remote
                    DeleteRemote($(this).val());

                    // remove local
                    $(this).remove();

                    // rebuild selection
                    TargetNS.RebuildSelection();
                }
            });

            if ($('#Profile').val() && $('#Profile').val() === 'last-search') {
                $('#SearchProfileDelete').hide();
            }

            Event.preventDefault();
            return false;
        });

    };
 // ---

    /**
     * @function
     * @param {Event} Action
     * @return nothing
     *      This function open the search dialog
     */

// ---
// ITSM
// ---
    //TargetNS.OpenSearchDialog = function (Action, Profile){
    TargetNS.OpenSearchDialog = function (Action, Profile, Class){
// ---
        if (!Action) {
            Action = Core.Config.Get('Action');
        }

        if (!Profile) {
            Profile = 'last-search';
        }
        var Data = {
// ---
// ITSM
// ---
//            Action: 'AgentSearch',
            Action: 'AgentITSMConfigItemSearch',
            Subaction: 'AJAX',
// ---
            Referrer: Action,
            Profile: Profile,
// ---
// ITSM
// ---
            ClassID: Class
// ---
        };

        ShowWaitingDialog();

        Core.AJAX.FunctionCall(
            Core.Config.Get('CGIHandle'),
            Data,
            function (HTML) {
                Core.UI.Dialog.ShowContentDialog(HTML, '', '10px', 'Center', true);
// ---
// ITSM
// ---
                TargetNS.SetSearchDialog();

//                // hide add template block
//                $('#SearchProfileAddBlock').hide();

//                if ($('#Profile').val() && $('#Profile').val() !== 'last-search') {
//                    $('#SearchProfileDelete').show();
//                }

//                // register add of attribute
//                $('.Add').bind('click', function () {
//                    var Attribute = $('#Attribute').val();
//                    TargetNS.ItemAdd(Attribute);
//                    TargetNS.RebuildSelection();

//                    return false;
//                });

//                // register return key
//                $('#SearchForm').unbind('keypress.FilterInput').bind('keypress.FilterInput', function (Event) {
//                    if ((Event.charCode || Event.keyCode) === 13) {
//                        $('#SearchForm').submit();
//                        return false;
//                    }
//                });

//                // register submit
//                $('#SearchFormSubmit').bind('click', function () {
//                    // Normal results mode will return HTML in the same window
//                    if ($('#SearchForm #ResultForm').val() === 'Normal') {
//                        $('#SearchForm').submit();
//                        ShowWaitingDialog();
//                    }
//                    else { // Print and CSV should open in a new window, no waiting dialog
//                        $('#SearchForm').attr('target', 'SearchResultPage');
//                        $('#SearchForm').submit();
//                        $('#SearchForm').attr('target', '');
//                    }
//                    return false;
//                });

//                // load profile
//                $('#Profile').bind('change', function () {
//                    var Profile = $('#Profile').val();
//                    TargetNS.OpenSearchDialog(Action, Profile);
//                    return false;
//                });

//                // show add profile block or not
//                $('#SearchProfileNew').bind('click', function (Event) {
//                    $('#SearchProfileAddBlock').toggle();
//                    Event.preventDefault();
//                    return false;
//                });

//                // add new profile
//                $('#SearchProfileAddAction').bind('click', function () {
//                    var Name, $Element1, $Element2;

//                    // get name
//                    Name = $('#SearchProfileAddName').val();
//                    if (!Name) {
//                        return false;
//                    }

//                    // add name to profile selection
//                    $Element1 = $('#ProfileList').children().first().clone();
//                    $Element1.text(Name);
//                    $('#ProfileList').append($Element1);
//                    $Element2 = $('#Profile').children().first().clone();
//                    $Element2.text(Name);
//                    $Element2.attr('value', Name);
//                    $Element2.attr('selected', 'selected');
//                    $('#Profile').append($Element2);

//                    // set input box to empty
//                    $('#SearchProfileAddName').val('');

//                    // hide add template block
//                    $('#SearchProfileAddBlock').hide();

//                    $('#SearchProfileDelete').show();

//                    return false;
//                });

//                // delete profile
//                $('#SearchProfileDelete').bind('click', function (Event) {

//                    // strip all already used attributes
//                    $('#Profile').find('option:selected').each(function () {
//                        if ($(this).attr('value') !== 'last-search') {

//                            // rebuild attributes
//                            $('#SearchInsert').text('');

//                            // remove remote
//                            DeleteRemote($(this).val());

//                            // remove local
//                            $(this).remove();

//                            // show fulltext
//                            TargetNS.ItemAdd('Fulltext');

//                            // rebuild selection
//                            TargetNS.RebuildSelection();
//                        }
//                    });

//                    if ($('#Profile').val() && $('#Profile').val() === 'last-search') {
//                        $('#SearchProfileDelete').hide();
//                    }

//                    Event.preventDefault();
//                    return false;
//                });
// ---

            }, 'html'
        );
    };

    return TargetNS;
// ---
// ITSM
// ---
//}(Core.Agent.Search || {}));
}(ITSM.Agent.ConfigItem.Search || {}));
//---