// Original synthesized nautical/chiptune effects. No network or audio downloads.
class GhostRouteAudio {
  constructor(enabled=true,volume=.22){this.enabled=enabled;this.volume=volume;this.context=null;this.nodes=new Set();}
  async unlock(){
    if(!this.enabled)return false;
    try{const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return false;
      this.context ||= new Audio();if(this.context.state==='suspended')await this.context.resume();
      return this.context.state==='running';
    }catch{return false;}
  }
  setEnabled(value){this.enabled=value;if(!value)for(const node of this.nodes){try{node.stop();}catch{}}}
  play(event){
    if(!this.enabled||!this.context||this.context.state!=='running'||document.hidden)return;
    const patterns={click:[440],move:[130,165],sensor:[660,880,1320],mark:[330,495],alert:[220,165,220],rescue:[523,659,784,1047],failure:[220,185,147,110],intro:[392,523]};
    const notes=patterns[event];if(!notes)return;
    try{notes.forEach((frequency,i)=>{
      const osc=this.context.createOscillator(),gain=this.context.createGain(),start=this.context.currentTime+i*.09;
      osc.type=event==='sensor'?'sine':'triangle';osc.frequency.setValueAtTime(frequency,start);
      gain.gain.setValueAtTime(0,start);gain.gain.linearRampToValueAtTime(this.volume*.35,start+.008);gain.gain.exponentialRampToValueAtTime(.0001,start+.16);
      osc.connect(gain);gain.connect(this.context.destination);this.nodes.add(osc);
      osc.onended=()=>{osc.disconnect();gain.disconnect();this.nodes.delete(osc);};osc.start(start);osc.stop(start+.18);
    });}catch{/* Audio restrictions never block navigation. */}
  }
}
