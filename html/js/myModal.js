/*Script che specifica il comportamento del modale*/

$('document').ready(function(){
	$('#welcomeModal').modal('show');
	$('#closeBtn').on('click', function(){
		$('#welcomeModal').modal('hide');
	});
});
