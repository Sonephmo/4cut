import { FunctionComponent } from 'react';
import styles from './PhotoFrame.module.css';
import ai1 from './AI1.png';
import ai2 from './AI2.png';

const PhotoFrameAI: FunctionComponent = () => {
  return (
    <div className={styles.photoFrameAi}>
      <div className={styles.photoFrameAiChild} />
      <div className={styles.photoFrameAiItem} />
      <div className={styles.photoFrameAiInner} />
      <div className={styles.rectangleDiv} />
      <img className={styles.ai2Icon} alt="AI 아이콘 2" src={ai2} />
      <img className={styles.ai1Icon} alt="AI 아이콘 1" src={ai1} />
      <div className={styles.div}>해솔네컷</div>
      <b className={styles.ai}>AI의료데이터학</b>
      <div className={styles.div2}>2026</div>
      <div className={styles.challengeChanceChange}>"CHAllenge,  CHAnce,  CHAnge"</div>
    </div>
  );
};

export default PhotoFrameAI;
