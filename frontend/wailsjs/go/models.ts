export namespace models {
	
	export class Track {
	    id: number;
	    disc_id: number;
	    title: string;
	    file_path: string;
	    duration: number;
	    order: number;
	
	    static createFrom(source: any = {}) {
	        return new Track(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.disc_id = source["disc_id"];
	        this.title = source["title"];
	        this.file_path = source["file_path"];
	        this.duration = source["duration"];
	        this.order = source["order"];
	    }
	}
	export class Disc {
	    id: number;
	    vinyl_id: number;
	    number: number;
	    tracks: Track[];
	
	    static createFrom(source: any = {}) {
	        return new Disc(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.vinyl_id = source["vinyl_id"];
	        this.number = source["number"];
	        this.tracks = this.convertValues(source["tracks"], Track);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	
	export class Vinyl {
	    id: number;
	    title: string;
	    artist: string;
	    coverPath: string;
	    playedAt: number;
	    discs: Disc[];
	
	    static createFrom(source: any = {}) {
	        return new Vinyl(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.title = source["title"];
	        this.artist = source["artist"];
	        this.coverPath = source["coverPath"];
	        this.playedAt = source["playedAt"];
	        this.discs = this.convertValues(source["discs"], Disc);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}

}

