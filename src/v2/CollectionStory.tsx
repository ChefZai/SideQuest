import { BookOpen, Heart, Sparkles } from "lucide-react";
import type { ActivityItem, Idea, Space } from "./domain";

export function CollectionStory({collection,quests,events,space}:{collection:Idea;quests:Idea[];events:ActivityItem[];space:Space}){
  const children=quests.filter(quest=>quest.collectionId===collection.id);
  const active=children.filter(quest=>!quest.completed);
  const memories=children.filter(quest=>quest.completed);
  const featured=memories.find(quest=>quest.photoUrl)||active.find(quest=>quest.photoUrl)||children[0];
  const recent=events.find(event=>event.questId&&children.some(quest=>quest.id===event.questId));
  const chapter=collection.chapterMode===true;
  return <section className={`collection-story${chapter?" life-chapter-story":""}`} aria-labelledby="collection-story-title">
    <header><span aria-hidden="true">{chapter?<BookOpen/>:<Sparkles/>}</span><div><p className="eyebrow">{chapter?"A chapter of your life":"A curated album"}</p><h2 id="collection-story-title">{chapter?"Inside this Chapter":"Inside this Collection"}</h2></div></header>
    {children.length?<><div className="collection-story-stats"><span><b>{children.length}</b> {children.length===1?"Quest":"Quests"}</span><span><b>{active.length}</b> still unfolding</span><span><b>{memories.length}</b> {memories.length===1?"Memory":"Memories"}</span><span><b>{space.memberIds.length}</b> {space.memberIds.length===1?"person":"people"}</span></div>{featured&&<article className="collection-featured" style={featured.photoUrl?{backgroundImage:`linear-gradient(90deg,rgba(23,39,36,.9),rgba(23,39,36,.18)),url(${featured.photoUrl})`}:undefined}><small>{featured.completed?"Featured Memory":"Featured Quest"}</small><h3>{featured.title}</h3><p>{featured.description||"A possibility that belongs in this story."}</p></article>}{recent&&<p className="collection-latest"><Heart aria-hidden="true"/><span><small>Latest Moment</small><b>{recent.title||recent.targetTitle||"This story moved forward."}</b></span></p>}</>:<div className="collection-story-empty"><BookOpen aria-hidden="true"/><h3>Every great collection starts with one memory.</h3><p>Gather the first Quest when something feels like it belongs here.</p></div>}
  </section>
}