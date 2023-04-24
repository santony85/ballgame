function genericFm(value, row, index, field) {
	
			return '<a snd-data-' + row['_id'] + '="' + field + '">' + value + '</a>';
	
		}
	function stateFm(value, row, index, field) {
		if(value=="1")return '<div class="divled divgreen"></div>'
		else return '<div class="divled divred"></div>'
	}	
	
	function signalFm(value, row, index, field) {
		if(value=="0")return '<i class="fa-solid fa-signal fa-lg" style="color:red;"></i>'
		else if(value=="1")return '<i class="fa-solid fa-signal fa-lg" style="color:orange;"></i>'
		else if(value=="2")return '<i class="fa-solid fa-signal fa-lg" style="color:green;"></i>'
		else if(value=="3")return '<i class="fa-solid fa-signal fa-lg" style="color:green;"></i>'
		else return '<i class="fa-solid fa-signal fa-lg"></i>'
	}
	
	function dateFm(value, row, index, field) {
		var dt = new Date(value);
		return '<a snd-data-' + row['_id'] + '="' + field + '">' + dt.toLocaleString() + '</a>';
	}
	
	function voltFm(value, row, index, field) {
		return '<a snd-data-' + row['_id'] + '="' + field + '">' +value + ' v</a>';
	}
	
	function tempFm(value, row, index, field) {
		return '<a snd-data-' + row['_id'] + '="' + field + '">' +value + ' cm</a>';
	}			
	
	function poidsFm(value, row, index, field) {
		return '<a snd-data-' + row['_id'] + '="' + field + '">' +value + ' kg</a>';
	}	
	function idFm(value, row, index, field) {
		return '<a snd-data-' + row['_id'] + '="' + field + '" style="font-weight: bold;" href="detaildevice/'+value+'">' +value + '</a>';
	}	
	
	function delFm(value, row) {
		//return '<a href="#" id="mdp" data-type="text" data-url="/utilisateurs/del" data-pk="'+row['_id']+'" data-name="_id">Supprimer</a>';
		return '<a href="/detaildevice/'+value+'"><button type="button" class="btn btn-info"><i class="fas fa-list"></i></button></a>&nbsp;'+
			   '<a href="/graphdevice/'+value+'"><button type="button" class="btn btn-info"><i class="fas fa-chart-column"></i></button></a>';
	}