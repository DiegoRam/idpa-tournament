# Quick Test Data Setup Script

Use these commands in the browser console while on the app to quickly create test data.

## 1. First, create test users by registering through the UI:

### Admin User
- Email: admin@test.com
- Password: TestPass123!
- Role: Admin
- Name: Admin User

### Club Owner
- Email: clubowner@test.com  
- Password: TestPass123!
- Role: Club Owner
- Name: Club Owner Test
- IDPA: CO123456

### Security Officer
- Email: so@test.com
- Password: TestPass123!
- Role: Security Officer  
- Name: SO Test
- IDPA: SO123456

### Shooters (create 5-10)
- Email: shooter1@test.com through shooter10@test.com
- Password: TestPass123!
- Role: Shooter
- Names: Shooter 1 through Shooter 10
- IDPA: SH000001 through SH000010
- Divisions: Mix of SSP, ESP, CDP, CO
- Classifications: Mix of MM, SS, EX

## 2. Quick Tournament Setup (as Club Owner)

### Club Details:
```
Name: Test Shooting Club
Address: 123 Range Road, Buenos Aires, Argentina
Coordinates: -34.6037, -58.3816
Max Squads: 10
All facilities checked
```

### Tournament Details:
```
Name: Test Championship 2024
Type: Monthly Match
Date: [2 weeks from today]
Registration Opens: [Tomorrow]
Registration Closes: [1 week from today]
Entry Fee: 5000 ARS
Capacity: 80
Squads: 8
Max per Squad: 10
Divisions: SSP, ESP, CDP, CO
Custom Category: Ladies, Veterans
```

## 3. Stage Templates (copy these when creating stages):

### Stage 1 - Standards
```
Name: El Presidente
Description: Classic 12 round drill
Strings: 1  
Rounds: 12
Par Time: 10
```

### Stage 2 - Scenario
```
Name: Home Defense
Description: 18 rounds, multiple strings
Strings: 3
Rounds: 18
Par Time: 25
```

### Stage 3 - Skills
```
Name: Strong Hand Only
Description: 12 rounds strong hand
Strings: 2
Rounds: 12
Par Time: 20
```

## 4. Sample Scores for Testing

### Good Shooter Score:
- String times: 5.23, 4.87, 5.45
- Hits: Mostly down-0, few down-1
- No penalties
- Total: ~16-18 seconds

### Average Shooter Score:
- String times: 6.5, 7.2, 6.8
- Hits: Mix of down-0, down-1, few down-3
- 1 procedural
- Total: ~25-30 seconds

### New Shooter Score:
- String times: 8.5, 9.2, 8.8
- Hits: Some misses, many down-3
- 2 procedurals
- Total: ~40-45 seconds

## 5. Testing Different Scenarios

### Squad Distribution:
- Squad A: Full (10 shooters)
- Squad B: Almost full (8-9 shooters)  
- Squad C-F: Partial (4-6 shooters each)
- Squad G-H: Empty or minimal (0-2 shooters)

### Friend Connections:
- Make shooter1 friends with shooter2, shooter3
- Make shooter4, shooter5, shooter6 from same club

### Scoring Progress:
- Complete all stages for 2-3 shooters
- Partial scores for 5-6 shooters
- No scores for remaining shooters

## 6. Quick Actions for Testing

### Trigger Badge Generation:
1. Complete all stages for a shooter
2. Make them division winner
3. Check badge generation

### Test Offline:
1. Load scoring page
2. Disconnect internet
3. Enter 2-3 scores
4. Reconnect and verify sync

### Test Conflicts:
1. Have 2 SOs score same shooter/stage
2. Use slightly different scores
3. Test resolution interface

## 7. Performance Testing Load

To test under load, quickly create:
- 100+ shooters registered
- 50+ with partial scores
- Multiple people viewing leaderboard
- SOs entering scores simultaneously

## Remember:
- Use incognito windows for different users
- Keep browser console open for errors
- Take screenshots of any issues
- Note exact steps to reproduce bugs