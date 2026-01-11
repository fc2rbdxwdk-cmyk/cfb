function rand(n){return Math.floor(Math.random()*n)}

function simulateDrive(offenseStyle='balanced', driveNum=1){
  const plays = []
  let yards = 0
  let time = 12
  const maxPlays = 10
  for(let i=0;i<maxPlays;i++){
    // Outcome influenced by offenseStyle
    let base = 3
    if(offenseStyle === 'pass') base = 5
    if(offenseStyle === 'run') base = 2
    if(offenseStyle === 'aggro') base = 6

    const variance = offenseStyle === 'run' ? 6 : 12
    const playYard = Math.max(-8, Math.floor((Math.random()*variance) - (variance/2) + base))
    yards += playYard
    time -= Math.max(1, Math.floor(Math.random()*3))
    plays.push({desc:`Drive ${driveNum} - Play ${i+1}`, yards: playYard, clock: time, type: offenseStyle})
    if(yards >= 10){
      return {result:'TD', plays, yards}
    }
    if(time <= 0) break
  }
  // field position influences punt vs FG but keep simple
  return {result:'Punt', plays, yards}
}

function runSimulation({homeId=1, awayId=2, playPlan=null} = {}){
  const events = []
  let homeScore = 0
  let awayScore = 0
  let momentum = 50

  for(let q=1;q<=4;q++){
    const style = playPlan && playPlan[q-1] ? playPlan[q-1] : (Math.random()>0.5?'balanced':'aggro')
    const drive = simulateDrive(style, q)
    const scoring = drive.result === 'TD' ? (Math.random()>0.2?7:6) : 0
    if(Math.random()>0.5){ homeScore += scoring; momentum = Math.min(100, momentum + Math.floor(Math.random()*10)) } else { awayScore += scoring; momentum = Math.max(0, momentum - Math.floor(Math.random()*10)) }
    events.push({quarter:q, drive, score:`${homeScore}-${awayScore}`, momentum})
  }

  const winner = homeScore >= awayScore ? 'home' : 'away'
  return { homeId, awayId, homeScore, awayScore, winner, events }
}

module.exports = { runSimulation }
