
var partieid=""

function genericFm(value, row, index,field) {
	return '<a snd-data-'+row['_id']+'="'+field+'">'+value+'</a>';
  }

function delFm(value, row) {
	//onclick="joinpart('+"'"+row['_id']+"'"+')"
  if(row.joueur2)return "";
  else return '<button type="button" class="btn btn-info newbt" data-bs-toggle="modal" data-bs-target="#exampleModalCenter2" onclick="joinpart('+"'"+row['_id']+"'"+')">REJOINDRE</button>'
  }


function joinpart(id){
	partieid=id;
	$("#_idj2").val(partieid);
}

function getDateFR(value){
  var today = new Date(value);
  var dd = String(today.getDate()).padStart(2, '0');
  var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
  var yyyy = today.getFullYear();
  today = dd + '/' + mm + '/' + yyyy;
  return today;
}

function dateFm(value, row, index,field) {    
	return '<a snd-data-'+row['_id']+'="'+field+'">'+getDateFR(value)+'</a>';
  }



$(document).ready(function () {
			
	$('.newbt').click(function(){
	  $('#myform')[0].reset();  
	  //$('#myformJ')[0].reset(); 
	})

	$("#myform").on('submit', function(e){
	  e.preventDefault();
	  var mdata = $('#myform').serialize();
	  $.ajax({
		url:'/addpartie',
		type:'post',
		data:mdata,
		  success:function(data){
			$('#exampleModalCenter').modal('hide');                    
			  $.ajax({
				  url:'/getDeviceData',
				  type:'get',
				  success:function(res){
					$("#mtable").bootstrapTable('load', res);
					$('#modalPartie').modal('show'); 
					$('#ifrm').attr('src','/createpartie/'+data.insertedId);
					//reload iframe with id : data.insertedId
				  }
				});
				
			  return false;
			}
		});
	  return false;
	});	
	
	$("#myformj").on('submit', function(e){
	  e.preventDefault();
	  var mdata = $('#myformj').serialize();
	  //add joueur 2 to db
	  $.ajax({
		url:'/addj2',
		type:'post',
		data:mdata,
		  success:function(data){
			console.log(data)  
			$('#exampleModalCenter2').modal('hide');
			$('#modalPartie').modal('show'); 
			$('#ifrm').attr('src','/partie/'+partieid);                       
			return false;
			}
		});
	  
	  
	  return false;
	});	
	
})

function confirmdel(id){
	bootbox.confirm("Voulez-vous supprimer cet element ?", function(result) {
	if(result){
		var db="produits"
		$.ajax({
			url:'/delobj/'+db+'/'+id,
			type:'get',
			success:function(){
			  location.reload();
			  return false;
			}
		});

		}
	});
}  

function editobj(mid){
	$('#myform')[0].reset();
	$('[snd-data-'+mid.toString()+']').each(function(i, el) // Temporary for demo purpose only
		{
		var $this   = $(el);
		var label   = $this.attr("snd-data-"+mid);
		var valeur  = $this.html();
		if(label ==="QRCODE"){$("#qrcode").val(valeur).change();}
		else if(label ==="AVIS"){$("#avis").val(valeur).change();}
		else $('input[name='+label+']').val(valeur);
		});
}

function getDateYYYYMMDDFormat(date){
  var tabSplit = date.split("/", 3);
  return tabSplit[2]+"-"+tabSplit[1]+"-"+tabSplit[0];
}

function findDateRange(){
  var dates = $('#d-dated').val();
  var datef = $('#d-datef').val();
  $("#tdatedeb").html(getDateFR(dates));
  $("#tdatefin").html(getDateFR(datef));
  $.ajax({
	url:'/listrapportsdate/'+dates+'/'+datef,
	type:'get',
	success:function(res){

	  $("#mtable").bootstrapTable('load', res)
	}
  });

}


