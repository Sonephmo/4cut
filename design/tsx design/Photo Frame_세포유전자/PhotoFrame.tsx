import { FunctionComponent } from 'react';
import styles from './PhotoFrame.module.css';
import icon1 from './세유1.png';
import icon2 from './세유2.png';

const PhotoFrame: FunctionComponent = () => {
  return (
    <div className={styles.photoFrame}>
      <div className={styles.photoFrameChild} />
      <div className={styles.photoFrameItem} />
      <div className={styles.photoFrameInner} />
      <div className={styles.rectangleDiv} />
      <img className={styles.icon} alt="세포유전자 아이콘 1" src={icon1} />
      <img className={styles.icon2} alt="세포유전자 아이콘 2" src={icon2} />
      <div className={styles.div}>해솔네컷</div>
      <b className={styles.b}>세포·유전자재생의학</b>
      <div className={styles.div2}>2026</div>
      <div className={styles.challengeChanceChange}>"CHAllenge,  CHAnce,  CHAnge"</div>
    </div>
  );
};

export default PhotoFrame;
