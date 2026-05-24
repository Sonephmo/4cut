import { FunctionComponent } from 'react';
import styles from './PhotoFrame.module.css';
import icon1 from './시스템1.png';
import icon2 from './시스템2.png';

const PhotoFrame: FunctionComponent = () => {
  return (
    <div className={styles.photoFrame}>
      <div className={styles.photoFrameChild} />
      <div className={styles.photoFrameItem} />
      <div className={styles.photoFrameInner} />
      <div className={styles.rectangleDiv} />
      <div className={styles.div}>해솔네컷</div>
      <b className={styles.b}>시스템생명과학</b>
      <div className={styles.div2}>2026</div>
      <div className={styles.challengeChanceChange}>"CHAllenge,  CHAnce,  CHAnge"</div>
      <img className={styles.icon} alt="시스템생명과학 아이콘 1" src={icon1} />
      <img className={styles.icon2} alt="시스템생명과학 아이콘 2" src={icon2} />
    </div>
  );
};

export default PhotoFrame;
